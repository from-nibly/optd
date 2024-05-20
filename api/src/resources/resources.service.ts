import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { Permission } from 'src/roles/roles.types';
import { ActorContext } from 'src/types/types';
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

  private createAuthzPathExpression(client: Knex, kind: string) {
    return client.raw(`CONCAT('/', r.namespace, '/${kind}/', r.name)`);
  }

  private addPermissionClauses(
    query: Knex.QueryBuilder,
    authzPathExpression: Knex.Raw,
    permissions: Permission[],
  ): Knex.QueryBuilder {
    let rtn = query;
    for (let i = 0; i < permissions.length; i++) {
      if (i === 0) {
        rtn = query.andWhereRaw(
          `${authzPathExpression} ~ '${permissions[i].path}'`,
        );
      } else {
        rtn = query.orWhereRaw(
          `${authzPathExpression} ~ '${permissions[i].path}'`,
        );
      }
    }
    return rtn;
  }

  async listResources(
    actorContext: ActorContext,
    namespace: string,
    kind: string,
  ): Promise<NamespacedResource[]> {
    const tableName = this.dbService.getResourceTableName(kind);
    this.logger.debug(`listing resources for ${namespace}/${kind}`, {
      actorContext,
    });
    const client = this.dbService.client;
    //TODO: should this be done in the db?
    //TODO: it could tie us to postgres in a weird way...
    //TODO: pagination...
    const permissions = actorContext.getPermissions('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    this.logger.debug('got permissions', { permissions });

    const authzPathExpression = this.createAuthzPathExpression(client, kind);
    let query = client(`${tableName} as r`)
      .select('*')
      .where('namespace', namespace);

    query = this.addPermissionClauses(query, authzPathExpression, permissions);

    this.logger.debug('running query', { query: query.toQuery() });

    const resp = await query;

    this.logger.debug('got query resp', { resp: resp[0] });

    return resp.map((r) => NamespacedResource.fromDBRecord(kind, r));
  }

  async getResource(
    actorContext: ActorContext,
    namespace: string,
    kind: string,
    name: string,
  ): Promise<NamespacedResource> {
    const tableName = this.dbService.getResourceTableName(kind);
    const client = this.dbService.client;
    const permissions = actorContext.getPermissions('read');

    if (permissions.length === 0) {
      throw new NotFoundException('resource not found');
    }

    const authzPathExpression = this.createAuthzPathExpression(client, kind);
    let query = client(`${tableName} as r`)
      .select('*')
      .where('namespace', namespace)
      .andWhere('name', name);

    query = this.addPermissionClauses(query, authzPathExpression, permissions);

    this.logger.debug('running query', { query: query.toQuery() });

    const resp = await query;

    if (resp.length === 0) {
      throw new NotFoundException('resource not found');
    }

    return NamespacedResource.fromDBRecord(kind, resp[0]);
  }

  async updateResource(
    actor: ActorContext,
    record: NamespacedUpdateResource,
    kind: string,
    message: string,
  ): Promise<NamespacedResource> {
    const tableName = this.dbService.getResourceTableName(kind);
    const historyTableName = this.dbService.getResourceHistoryTableName(kind);
    const permissions = actor.getPermissions('update');

    this.logger.debug('updating resource record', permissions);
    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    return this.dbService.client.transaction(async (trx) => {
      let query = trx(`${tableName} as r`)
        .select('*')
        .where('namespace', record.metadata.namespace)
        .where('name', record.metadata.name);

      const authzPathExpression = this.createAuthzPathExpression(trx, kind);
      this.addPermissionClauses(query, authzPathExpression, permissions);

      const [existing, ...extra] = await query;

      if (extra.length > 0) {
        this.logger.error(
          `found multiple resources with name ${record.metadata.name}`,
        );
        throw new BadRequestException('multiple resources with same name');
      }
      if (!existing) {
        throw new NotFoundException('resource not found');
      }

      //ensure no edits have been made since the record was fetched
      //if the history is null the intention is to overwrite no matter what
      if (record.history.id && existing.revision_id !== record.history.id) {
        this.logger.error('resource history id mismatch');
        throw new BadRequestException('resource history id mismatch');
      }

      await this.hookService.executeHook('preUpdate', kind, record);

      this.logger.debug('inserting history record');
      const historyResult = await trx(historyTableName)
        .insert(existing)
        .returning('*');
      this.logger.debug('got history', historyResult);
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

      return NamespacedResource.fromDBRecord(kind, updated);
    });
  }

  async createResource(
    actorContext: ActorContext,
    record: NamespacedCreateResource,
    kind: string,
    actor: ActorContext,
    message: string,
  ): Promise<NamespacedResource> {
    this.logger.debug('creating resource record', record);
    const tableName = this.dbService.getResourceTableName(kind);

    const permissions = actorContext.getPermissions('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const namespace = record.metadata.namespace;
    const name = record.metadata.name;

    return this.dbService.client.transaction(async (trx) => {
      await this.hookService.executeHook('preCreate', kind, record);

      const dbRecord = record.toDBRecord(actor, message);

      const newDBRecord = await trx(tableName).insert(dbRecord).returning('*');

      const authzPathExpression = this.createAuthzPathExpression(trx, kind);
      let query = trx(`${tableName} as r`)
        .select('*')
        .where('namespace', namespace)
        .andWhere('name', name);

      query = this.addPermissionClauses(
        query,
        authzPathExpression,
        permissions,
      );

      const permResult = await query;

      if (permResult.length === 0) {
        throw new ForbiddenException(
          `Cannot create kind:[${kind}] resource name:[${name}] in namespace:[${namespace}]`,
        );
      }

      const newRecord = NamespacedResource.fromDBRecord(
        record.metadata.kind,
        newDBRecord[0],
      );

      //TODO should post create block a creation?
      await this.hookService.executeHook('postCreate', kind, newRecord);

      return newRecord;
    });
  }
}
