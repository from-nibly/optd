import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import {
  NamespacedCreateResource,
  NamespacedResource,
  NamespacedUpdateResource,
} from './resources.types';
import { NamespacedResourceDBRecord } from './resources.types.record';
import { ActorContext } from 'src/types/types';
import knex from 'knex';

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
    this.logger.debug(`listing resources for ${namespace}/${kind}`, {
      actorContext,
    });
    const client = this.dbService.client;
    //TODO: pagination...
    const authzPathExpression = client.raw(
      `CONCAT('/', r.namespace, '/${kind}/', r.name)`,
    );
    //TODO optimize by removing irrelevant regex expressions?
    const permissions = actorContext.roles
      .map((r) => r.spec.permissions)
      .flat()
      .filter((p) => p.actions.includes('list'));

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    this.logger.debug('got permissions', { permissions });

    const query = client(`${this.dbService.getResourceTableName(kind)} as r`)
      .select(authzPathExpression, '*')
      .where('namespace', namespace);

    for (let i = 0; i < permissions.length; i++) {
      if (i === 0) {
        query.andWhereRaw(`${authzPathExpression} ~ '${permissions[i].path}'`);
      } else {
        query.orWhereRaw(`${authzPathExpression} ~ '${permissions[i].path}'`);
      }
    }

    this.logger.debug('running query', { query: query.toQuery() });

    const resp = await query;

    this.logger.debug('got query resp', { resp: resp[0] });

    return resp.map((r) => NamespacedResource.fromDBRecord(kind, r));
  }

  async getResource(
    namespace: string,
    kind: string,
    name: string,
  ): Promise<NamespacedResource> {
    const resp = await this.dbService
      .client(this.dbService.getResourceTableName(kind))
      .select('*')
      .where('namespace', namespace)
      .andWhere('name', name);
    return NamespacedResource.fromDBRecord(kind, resp[0]);
  }

  async updateResource(
    record: NamespacedUpdateResource,
    kind: string,
    actor: ActorContext,
    message: string,
  ): Promise<NamespacedResource> {
    const tableName = this.dbService.getResourceTableName(kind);
    const historyTableName = this.dbService.getResourceHistoryTableName(kind);

    return this.dbService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx(tableName)
        .select('*')
        .where('namespace', record.metadata.namespace)
        .where('name', record.metadata.name);
      if (extra.length > 0) {
        this.logger.error(
          `found multiple resources with name ${record.metadata.name}`,
        );
        throw new Error('multiple resources with same name');
      }
      if (!existing) {
        throw new Error('resource not found');
      }

      await this.hookService.executeHook('preUpdate', kind, record);

      this.logger.debug('inserting history record');
      const historyResult = await trx(historyTableName)
        .insert(existing)
        .returning('*');
      this.logger.debug('got history', historyResult);
      this.logger.debug('deleting existing record');
      const results = await trx(tableName)
        .where('name', record.metadata.name)
        .where('namespace', record.metadata.namespace)
        .del();
      this.logger.debug('deleted existing record', results);

      const [updated, ...extraUpdate] = await trx(tableName)
        .insert<NamespacedResourceDBRecord>(
          record.toDBRecord(actor, existing.revision_id, message),
        )
        .returning('*');

      if (extraUpdate.length > 0) {
        this.logger.error('multiple resource updates returned');
        throw new Error('multiple resource updates returned');
      }
      if (!updated) {
        this.logger.error('no resource update returned');
        throw new Error('no resource update returned');
      }

      await this.hookService.executeHook('postUpdate', kind, updated);

      return NamespacedResource.fromDBRecord(kind, existing);
    });
  }

  async createResource(
    record: NamespacedCreateResource,
    resourceKind: string,
    actor: ActorContext,
    message: string,
  ): Promise<NamespacedResource> {
    this.logger.debug('creating resource record', record);
    return this.dbService.client.transaction(async (trx) => {
      await this.hookService.executeHook('preCreate', resourceKind, record);

      const dbRecord = record.toDBRecord(actor, message);

      const newDBRecord = await trx(
        this.dbService.getResourceTableName(record.metadata.kind),
      )
        .insert(dbRecord)
        .returning('*');

      const newRecord = NamespacedResource.fromDBRecord(
        record.metadata.kind,
        newDBRecord[0],
      );

      await this.hookService.executeHook('postCreate', resourceKind, newRecord);

      return newRecord;
    });
  }
}
