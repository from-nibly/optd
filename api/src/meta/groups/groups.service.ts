import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { Knex } from 'knex';
import { CreateGroup, Group, UpdateGroup } from './groups.types';
import { GroupDBRecord } from './groups.types.record';
import { Subject } from 'src/meta/subjects/subjects.types';
import { ActorContext } from 'src/types/types';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.databaseService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableExists = await trx.schema.hasTable('meta_group');
      if (tableExists) {
        return;
      }

      const commonFields = (table: Knex.CreateTableBuilder) => {
        table.string('name', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();

        // unstructured in database
        table.jsonb('metadata_annotations').notNullable();
        table.jsonb('metadata_labels').notNullable();
        table.jsonb('status').notNullable();

        //single string to represent current state
        table
          .string('state', 255)
          .checkRegex('^[a-z][a-z0-9-]*$')
          .notNullable();

        //spec is unstructured
        table.jsonb('spec').notNullable();

        //history
        table.uuid('revision_id').notNullable();
        table.datetime('revision_at', { useTz: true }).notNullable();
        table.string('revision_by', 255).notNullable();
        table.text('revision_message').nullable();
        table.uuid('revision_parent').nullable();
      };

      await trx.schema.createTable('meta_group', (table) => {
        commonFields(table);
        table.primary(['name']);
      });

      await trx.schema.createTable('meta_group_history', (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        trx.raw('REVOKE UPDATE ON meta_group_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_group_history FROM optd');
      });
    });
  }

  async listGroups(): Promise<Group[]> {
    const resp = await this.databaseService
      .client('meta_group')
      .select<GroupDBRecord[]>('*');
    return resp.map((record) => Group.fromDBRecord(record));
  }

  async listGroupsForSubject(subject: Subject): Promise<Group[]> {
    const resp = await this.databaseService
      .client('meta_group')
      .select<GroupDBRecord[]>('*')
      .whereJsonSupersetOf('spec', { subjects: [subject.metadata.name] });
    return resp.map((record) => Group.fromDBRecord(record));
  }

  async getGroup(id: string): Promise<Group> {
    const resp = await this.databaseService
      .client('meta_group')
      .where('name', id)
      .select<GroupDBRecord[]>('*');
    if (resp.length === 0) {
      throw new Error('group not found');
    }
    if (resp.length > 1) {
      throw new Error('multiple groups with same id');
    }
    this.logger.debug('got group', { resp: resp[0] });
    return Group.fromDBRecord(resp[0]);
  }

  async createGroup(
    group: CreateGroup,
    actor: ActorContext,
    message?: string,
  ): Promise<Group> {
    this.logger.debug('creating group record', group);

    const dbRecord = group.toDBRecord(actor, message);

    return this.databaseService.client.transaction(async (trx) => {
      const resp = await trx('meta_group')
        .insert<GroupDBRecord>(dbRecord)
        .returning('*');

      return Group.fromDBRecord(resp[0]);
    });
  }

  async updateGroup(
    group: UpdateGroup,
    actor: ActorContext,
    message?: string,
  ): Promise<Group> {
    return this.databaseService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx('meta_group')
        .select('*')
        .where('name', group.metadata.name);
      if (extra.length > 0) {
        this.logger.error(
          `found multiple groups with name ${group.metadata.name}`,
        );
        throw new Error('multiple groups with same name');
      }
      if (!existing) {
        throw new Error('group not found');
      }

      await trx('meta_group_history').insert(existing);
      await trx('meta_group').where('name', group.metadata.name).del();
      const [updated, ...extraUpdate] = await trx('meta_group')
        .insert<GroupDBRecord>(
          group.toDBRecord(actor, existing.revision_id, message),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error('multiple group updates returned');
        throw new Error('multiple group updates returned');
      }
      if (!updated) {
        this.logger.error('no group update returned');
        throw new Error('no group update returned');
      }

      return Group.fromDBRecord(updated);
    });
  }
}
