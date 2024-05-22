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
    namespace: string,
    kind: string,
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
    namespace: string,
    kind: string,
    name: string,
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
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook('preUpdate', kind, newRecord);
        },
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook('postUpdate', kind, newRecord);
        },
        record.metadata.namespace,
      );

    return NamespacedResource.fromDBRecord(kind, updated);
  }

  async createResource(
    actor: ActorContext,
    record: NamespacedCreateResource,
    kind: string,
    message: string,
  ): Promise<NamespacedResource> {
    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const namespace = record.metadata.namespace;

    const created =
      await this.dbService.createResource<NamespacedResourceDBRecord>(
        kind,
        record.toDBRecord(actor, message),
        permissions,
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook('preCreate', kind, newRecord);
        },
        async (result) => {
          const newRecord = NamespacedResource.fromDBRecord(kind, result);
          this.hookService.executeHook('postCreate', kind, newRecord);
        },
        namespace,
      );

    return NamespacedResource.fromDBRecord(kind, created);
  }
}
