import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { Knex } from 'knex';
import { CreateRole, Role, UpdateRole } from './roles.types';
import { RoleDBRecord } from './roles.types.record';
import { Subject } from 'src/meta/subjects/subjects.types';
import { Group } from 'src/groups/groups.types';
import { ActorContext } from 'src/types/types';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.databaseService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableExists = await trx.schema.hasTable('meta_role');
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

      await trx.schema.createTable('meta_role', (table) => {
        commonFields(table);
        table.primary(['name']);
      });

      await trx.schema.createTable('meta_role_history', (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        trx.raw('REVOKE UPDATE ON meta_role_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_role_history FROM optd');
      });
    });
  }

  async listRoles(): Promise<Role[]> {
    const resp = await this.databaseService
      .client('meta_role')
      .select<RoleDBRecord[]>('*');
    return resp.map((record) => Role.fromDBRecord(record));
  }

  async getAllRoles(names: string[]): Promise<Role[]> {
    const resp = await this.databaseService
      .client('meta_role')
      .whereIn('name', names)
      .select<RoleDBRecord[]>('*');
    return resp.map((record) => Role.fromDBRecord(record));
  }

  async getRole(name: string): Promise<Role> {
    const resp = await this.databaseService
      .client('meta_role')
      .where('name', name)
      .select<RoleDBRecord[]>('*');
    if (resp.length === 0) {
      throw new Error('role not found');
    }
    if (resp.length > 1) {
      throw new Error('multiple roles with same id');
    }
    this.logger.debug('got role', { resp: resp[0] });
    return Role.fromDBRecord(resp[0]);
  }

  async createRole(
    role: CreateRole,
    actor: ActorContext,
    message?: string,
  ): Promise<Role> {
    this.logger.debug('creating role record', role);

    const dbRecord = role.toDBRecord(actor, message);

    return this.databaseService.client.transaction(async (trx) => {
      const resp = await trx('meta_role')
        .insert<RoleDBRecord>(dbRecord)
        .returning('*');

      return Role.fromDBRecord(resp[0]);
    });
  }

  async updateRole(
    role: UpdateRole,
    actor: ActorContext,
    message?: string,
  ): Promise<Role> {
    return this.databaseService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx('meta_role')
        .select('*')
        .where('name', role.metadata.name);
      if (extra.length > 0) {
        this.logger.error(
          `found multiple roles with name ${role.metadata.name}`,
        );
        throw new Error('multiple roles with same name');
      }
      if (!existing) {
        throw new Error('role not found');
      }

      await trx('meta_role_history').insert(existing);
      await trx('meta_role').where('name', role.metadata.name).del();
      const [updated, ...extraUpdate] = await trx('meta_role')
        .insert<RoleDBRecord>(
          role.toDBRecord(actor, existing.revision_id, message),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error('multiple role updates returned');
        throw new Error('multiple role updates returned');
      }
      if (!updated) {
        this.logger.error('no role update returned');
        throw new Error('no role update returned');
      }

      return Role.fromDBRecord(updated);
    });
  }
}