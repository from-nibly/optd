import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { CreateGroup, Group, UpdateGroup } from './groups.types';
import { GroupDBRecord } from './groups.types.record';
import { ActorContext } from 'src/types/types';
import { HooksService } from 'src/hooks/hooks.service';
import { Subject } from '../subjects/subjects.types';
import { MigrationService } from 'src/database/migrations/migrations.service';
import { v4 as uuid } from 'uuid';
import { Kind } from '../kinds/kinds.types';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.migrationService.addMetaTablesMigration(Group.kind, Group.kind);
  }

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.dbService.getResourceInternal(
      Kind.kind,
      Group.kind,
    );
    if (!result || result.length == 0) {
      await this.dbService.createResourceInternal(
        Kind.kind,
        {
          name: Group.kind,
          metadata_annotations: {},
          metadata_labels: {},
          status: {},
          state: 'ready',
          spec: {
            is_meta: true,
          },
          revision_id: uuid(),
          revision_at: new Date().toISOString(),
          revision_by: 'system',
          revision_parent: null,
          revision_message: 'System Created',
        },
        async () => {},
        async () => {},
      );
    }
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
    actorContext: ActorContext,
    record: CreateGroup,
    message: string,
  ): Promise<Group> {
    const permissions = actorContext.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<GroupDBRecord>(
      Group.kind,
      record.toDBRecord(actorContext, message),
      permissions,
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Group.kind,
          'preCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Group.fromDBRecord(result);

        this.hookService.executeHook(
          actorContext,
          Group.kind,
          'postCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
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
        this.hookService.executeHook(
          actorContext,
          Group.kind,
          'preUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Group.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Group.kind,
          'postUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
    );

    return Group.fromDBRecord(updated);
  }
}
