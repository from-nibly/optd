import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { ActorContext } from 'src/types/types';
import { CreateRole, Role, UpdateRole } from './roles.types';
import { RoleDBRecord } from './roles.types.record';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.dbService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableName = this.dbService.getTableName(Role.kind);
      const historyTableName = this.dbService.getHistoryTableName('roles');
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
        trx.raw('REVOKE UPDATE ON meta_roles_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_roles_history FROM optd');
      });
    });
  }

  async listRoles(actorContext: ActorContext): Promise<Role[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<RoleDBRecord>(
      Role.kind,
      permissions,
    );

    return resp.map((r) => Role.fromDBRecord(r));
  }

  async getAllRolesInternal(names: string[]): Promise<Role[]> {
    const resp = await this.dbService
      .client(this.dbService.getTableName(Role.kind))
      .whereIn('name', names)
      .select<RoleDBRecord[]>('*');
    return resp.map((record) => Role.fromDBRecord(record));
  }

  async getRole(actorContext: ActorContext, name: string): Promise<Role> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`Role with name ${name} not found`);
    }

    const resp = await this.dbService.getResource<RoleDBRecord>(
      Role.kind,
      permissions,
      name,
    );
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple Role with name ${name}, using first`);
      throw new InternalServerErrorException('multiple Role with same name');
    }
    return Role.fromDBRecord(resp[0]);
  }

  async createRole(
    actor: ActorContext,
    record: CreateRole,
    message: string,
  ): Promise<Role> {
    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<RoleDBRecord>(
      Role.kind,
      record.toDBRecord(actor, message),
      permissions,
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook('preCreate', Role.kind, newRecord);
      },
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook('postCreate', Role.kind, newRecord);
      },
    );

    return Role.fromDBRecord(created);
  }

  async updateRole(
    actorContext: ActorContext,
    record: UpdateRole,
    message: string,
  ): Promise<Role> {
    const permissions = actorContext.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = record.toDBRecord(actorContext, message);

    const updated = await this.dbService.updateResource<RoleDBRecord>(
      Role.kind,
      resource,
      permissions,
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook('preUpdate', Role.kind, newRecord);
      },
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook('postUpdate', Role.kind, newRecord);
      },
    );

    return Role.fromDBRecord(updated);
  }
}
