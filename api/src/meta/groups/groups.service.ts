import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { Knex } from 'knex';
import { CreateGroup, Group, UpdateGroup } from './groups.types';
import { GroupDBRecord } from './groups.types.record';
import { ActorContext } from 'src/types/types';
import { HooksService } from 'src/hooks/hooks.service';
import { Subject } from '../subjects/subjects.types';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.dbService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableName = this.dbService.getTableName('groups');
      const historyTableName = this.dbService.getHistoryTableName('groups');
      const tableExists = await trx.schema.hasTable(tableName);
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

      await trx.schema.createTable(tableName, (table) => {
        commonFields(table);
        table.primary(['name']);
      });

      await trx.schema.createTable(historyTableName, (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        trx.raw('REVOKE UPDATE ON meta_group_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_group_history FROM optd');
      });
    });
  }

  async listGroups(actorContext: ActorContext): Promise<Group[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<GroupDBRecord>(
      Group.kind,
      permissions,
    );

    return resp.map((r) => Group.fromDBRecord(r));
  }

  async listGroupsForSubject(subject: Subject): Promise<Group[]> {
    const query = this.dbService
      .client(this.dbService.getTableName(Group.kind))
      .select<GroupDBRecord[]>('*')
      .whereJsonSupersetOf('spec', { subjects: [subject.metadata.name] });
    this.logger.debug('querying groups for perms', query.toQuery());
    const resp = await query;

    return resp.map((record) => Group.fromDBRecord(record));
  }

  async getGroup(actorContext: ActorContext, name: string): Promise<Group> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`Group with name ${name} not found`);
    }

    const resp = await this.dbService.getResource<GroupDBRecord>(
      Group.kind,
      permissions,
      name,
    );
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Group with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple Groups with name ${name}, using first`);
      throw new InternalServerErrorException('multiple Groups with same name');
    }
    return Group.fromDBRecord(resp[0]);
  }

  async createGroup(
    actor: ActorContext,
    record: CreateGroup,
    message: string,
  ): Promise<Group> {
    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<GroupDBRecord>(
      Group.kind,
      record.toDBRecord(actor, message),
      permissions,
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook('preCreate', Group.kind, newRecord);
      },
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook('postCreate', Group.kind, newRecord);
      },
    );

    return Group.fromDBRecord(created);
  }

  async updateGroup(
    actorContext: ActorContext,
    record: UpdateGroup,
    message: string,
  ): Promise<Group> {
    const permissions = actorContext.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = record.toDBRecord(actorContext, message);

    const updated = await this.dbService.updateResource<GroupDBRecord>(
      Group.kind,
      resource,
      permissions,
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook('preUpdate', Group.kind, newRecord);
      },
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook('postUpdate', Group.kind, newRecord);
      },
    );

    return Group.fromDBRecord(updated);
  }
}
