import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { ActorContext } from 'src/types/types';
import { NamespacedDBRecord } from 'src/types/types.record';
import {
  NamespacedCreateResource,
  NamespacedResource,
  NamespacedUpdateResource,
} from './resources.types';
import { NamespacedResourceDBRecord } from './resources.types.record';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async listResources(
    actorContext: ActorContext,
    kind: string,
    namespace?: string,
  ): Promise<NamespacedResource[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<NamespacedDBRecord>(
      kind,
      permissions,
      namespace,
    );

    return resp.map((r) => NamespacedResource.fromDBRecord(kind, r));
  }

  async getResource(
    actorContext: ActorContext,
    kind: string,
    name: string,
    namespace?: string,
  ): Promise<NamespacedResource> {
    const permissions = actorContext.getPermissionPaths('read');

    if (permissions.length === 0) {
      throw new NotFoundException('resource not found');
    }

    const resp = await this.dbService.getResource<NamespacedDBRecord>(
      kind,
      permissions,
      name,
      namespace,
    );

    if (resp.length === 0) {
      throw new NotFoundException('resource not found');
    }

    return NamespacedResource.fromDBRecord(kind, resp[0]);
  }

  async listResourceHistory(
    actorContext: ActorContext,
    kind: string,
    name: string,
    namespace?: string,
  ): Promise<NamespacedResource[]> {
    const permissions = actorContext.getPermissionPaths('history');

    if (permissions.length === 0) {
      throw new NotFoundException('resource not found');
    }

    const resp = await this.dbService.listResourceHistory<NamespacedDBRecord>(
      kind,
      permissions,
      name,
      namespace,
    );

    return resp.map((r) => NamespacedResource.fromDBRecord(kind, r));
  }

  async updateResource(
    actorContext: ActorContext,
    record: NamespacedUpdateResource,
    kind: string,
    message: string,
  ): Promise<NamespacedResource> {
    const permissions = actorContext.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = record.toDBRecord(actorContext, message);

    const updated =
      await this.dbService.updateResource<NamespacedResourceDBRecord>(
        kind,
        resource,
        permissions,
        async (existing, update) => {
          const updateRecord = NamespacedResource.fromDBRecord(kind, update);
          const existingRecord = NamespacedResource.fromDBRecord(
            kind,
            existing,
          );
          this.hookService.executeHook(
            actorContext,
            kind,
            'preUpdate',
            { update: updateRecord, existing: existingRecord },
            updateRecord.metadata.name,
          );
        },
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook(
            actorContext,
            kind,
            'postUpdate',
            { payload: newRecord },
            newRecord.metadata.name,
          );
        },
        record.metadata.namespace,
      );

    return NamespacedResource.fromDBRecord(kind, updated);
  }

  async createResource(
    actorContext: ActorContext,
    record: NamespacedCreateResource,
    kind: string,
    message: string,
  ): Promise<NamespacedResource> {
    const permissions = actorContext.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const namespace = record.metadata.namespace;

    const created =
      await this.dbService.createResource<NamespacedResourceDBRecord>(
        kind,
        record.toDBRecord(actorContext, message),
        permissions,
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook(
            actorContext,
            kind,
            'preCreate',
            { payload: newRecord },
            newRecord.metadata.name,
          );
        },
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook(
            actorContext,
            kind,
            'postCreate',
            { payload: newRecord },
            newRecord.metadata.name,
          );
        },

        namespace,
      );

    return NamespacedResource.fromDBRecord(kind, created);
  }
}
