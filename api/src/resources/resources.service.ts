import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import {
  NamespacedCreateResource,
  NamespacedResource,
  NamespacedUpdateResource,
} from './resources.types';
import { UserContext } from 'src/types/types';
import { NamespacedResourceDBRecord } from './resources.types.record';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async listResources(
    namespace: string,
    kind: string,
  ): Promise<NamespacedResource[]> {
    //TODO: pagination...
    const resp = await this.dbService
      .client(this.dbService.getResourceTableName(kind))
      .select('*')
      .where('namespace', namespace);
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
    username: string,
    message: string,
  ): Promise<NamespacedResource> {
    const tableName = this.dbService.getResourceTableName(kind);
    const historyTableName = this.dbService.getResourceHistoryTableName(kind);
    this.logger.debug('');

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
          record.toDBRecord(
            new UserContext(username),
            existing.revision_id,
            message,
          ),
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
    username: string,
    message: string,
  ): Promise<NamespacedResource> {
    this.logger.debug('creating resource record', record);
    return this.dbService.client.transaction(async (trx) => {
      await this.hookService.executeHook('preCreate', resourceKind, record);

      const dbRecord = record.toDBRecord(new UserContext(username), message);

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
