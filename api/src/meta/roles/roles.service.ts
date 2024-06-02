import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { ActorContext } from 'src/types/types';
import { CreateRole, Role, UpdateRole } from './roles.types';
import { RoleDBRecord } from './roles.types.record';
import { MigrationService } from 'src/database/migrations/migrations.service';
import { Kind } from '../kinds/kinds.types';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.migrationService.addMetaTablesMigration(Role.kind, Role.kind);
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
    actorContext: ActorContext,
    record: CreateRole,
    message: string,
  ): Promise<Role> {
    const permissions = actorContext.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<RoleDBRecord>(
      Role.kind,
      record.toDBRecord(actorContext, message),
      permissions,
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Role.kind,
          'preCreate',
          newRecord,
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Role.fromDBRecord(result);

        this.hookService.executeHook(
          actorContext,
          Role.kind,
          'postCreate',
          newRecord,
          newRecord.metadata.name,
        );
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
        this.hookService.executeHook(
          actorContext,
          Role.kind,
          'preUpdate',
          newRecord,
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Role.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Role.kind,
          'postUpdate',
          newRecord,
          newRecord.metadata.name,
        );
      },
    );

    return Role.fromDBRecord(updated);
  }
}
