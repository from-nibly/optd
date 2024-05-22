import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import * as knex from 'knex';
import { Knex } from 'knex';
import { Group } from 'src/meta/groups/groups.types';
import { Kind } from 'src/meta/kinds/kinds.types';
import { Role } from 'src/meta/roles/roles.types';
import { Subject } from 'src/meta/subjects/subjects.types';
import { GlobalDBRecord } from 'src/types/types.record';

const metaKinds: string[] = [Kind.kind, Role.kind, Group.kind, Subject.kind];

@Injectable()
export class DatabaseService {
  private knex: knex.Knex<any, any> | undefined;
  private logger = new Logger(DatabaseService.name);

  constructor() {}

  get client() {
    if (!this.knex) {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: 'localhost',
          user: 'optd',
          password: 'foobar',
          database: 'optd',
        },
      });
    }
    return this.knex;
  }

  getTableName(resourceKind: string) {
    if (metaKinds.includes(resourceKind)) {
      return `meta_${resourceKind}`;
    }
    return `resource_${resourceKind}`;
  }

  getHistoryTableName(resourceKind: string) {
    if (metaKinds.includes(resourceKind)) {
      return `meta_${resourceKind}_history`;
    }
    return `resource_${resourceKind}_history`;
  }

  private createAuthzPathExpression(
    kind: string,
    namespace: string | undefined,
  ) {
    if (metaKinds.includes(kind)) {
      return this.client.raw(`CONCAT('/meta/${kind}/', r.name)`);
    }
    if (namespace) {
      return this.client.raw(`CONCAT('/', r.namespace, '/${kind}/', r.name)`);
    }
    return this.client.raw(`CONCAT('/global/${kind}/', r.name)`);
  }

  private addPermissionClauses<T extends GlobalDBRecord>(
    query: Knex.QueryBuilder,
    authzPathExpression: Knex.Raw,
    permissionRegexList: string[],
  ): Knex.QueryBuilder<T> {
    //TODO: nested select query for performance?
    return query.where((builder) => {
      permissionRegexList.forEach((permissionRegex) => {
        builder.orWhereRaw(`${authzPathExpression} ~ '${permissionRegex}'`);
      });
    });
  }

  async listResources<T extends GlobalDBRecord>(
    kind: string,
    permissionRegexList: string[],
    namespace?: string,
  ): Promise<T[]> {
    const tableName = this.getTableName(kind);

    let query = this.client(`${tableName} as r`).select<T[]>('*');
    if (namespace) {
      query = query.where('namespace', namespace);
    }

    const authzPathExpression = this.createAuthzPathExpression(kind, namespace);
    query = this.addPermissionClauses<T>(
      query,
      authzPathExpression,
      permissionRegexList,
    );
    this.logger.debug('list resources query', query.toSQL());
    return query as any;
  }

  async getResource<T extends GlobalDBRecord>(
    kind: string,
    permissionRegexList: string[],
    name: string,
    namespace?: string,
  ): Promise<T[]> {
    const tableName = this.getTableName(kind);

    let query = this.client(`${tableName} as r`)
      .select<T[]>('*')
      .where('name', name);

    if (namespace) {
      query = query.andWhere('namespace', namespace);
    }

    const authzPathExpression = this.createAuthzPathExpression(kind, namespace);
    return this.addPermissionClauses<T>(
      query,
      authzPathExpression,
      permissionRegexList,
    );
  }

  async updateResource<T extends GlobalDBRecord>(
    kind: string,
    resource: T,
    permissionRegexList: string[],
    preUpdate: (result: T) => Promise<void>,
    postUpdate: (result: T) => Promise<void>,
    namespace?: string,
  ): Promise<T> {
    //TODO: are the nestjs exceptions OK to have in here?
    const tableName = this.getTableName(kind);
    const historyTableName = this.getHistoryTableName(kind);
    //history etc
    return this.client.transaction(async (trx) => {
      let query = trx().select<T[]>('*').where('name', resource.name);

      if (namespace) {
        query = query.andWhere('namespace', namespace);
      }
      const authzPathExpression = this.createAuthzPathExpression(
        kind,
        namespace,
      );
      this.addPermissionClauses(
        query,
        authzPathExpression,
        permissionRegexList,
      );

      const [existing, ...extra] = await query;

      if (extra.length > 0) {
        this.logger.error(`found multiple kinds with name ${resource.name}`);
        throw new Error('multiple kinds with same name');
      }

      if (!existing) {
        throw new NotFoundException(
          `Kind with name ${resource.name} not found`,
        );
      }

      //ensure no edits have been made since the record was fetched
      //if the history is null the intention is to overwrite no matter what
      if (
        resource.revision_id &&
        existing.revision_id !== resource.revision_id
      ) {
        this.logger.error('resource history id mismatch');
        throw new BadRequestException('resource history id mismatch');
      }

      await preUpdate(resource);

      //move existing record to history
      await trx(historyTableName).insert(existing);
      //TODO it might be a performance issue to delete and recreate?
      //delete old record
      await trx(tableName).where('name', resource.name).del();
      //create new record
      const [updated, ...extraUpdate] = await trx(tableName)
        .insert<T>(resource)
        .returning('*');

      if (extraUpdate.length > 0) {
        this.logger.error('multiple resource updates returned');
        throw new Error('multiple resource updates returned');
      }

      if (!updated) {
        this.logger.error('no resource update returned');
        throw new Error('no resource update returned');
      }

      //TODO: should this be done after the transaction is committed?
      await postUpdate(updated);

      return updated;
    });
  }
  async createResource<T extends GlobalDBRecord>(
    kind: string,
    resource: T,
    permissionRegexList: string[],
    preCreate: (result: T) => Promise<void>,
    postCreate: (result: T, trx: Knex.Transaction) => Promise<void>,
    namespace?: string,
  ): Promise<T> {
    this.logger.debug('creating resource record', resource);
    const tableName = this.getTableName(kind);
    const name = resource.name;

    return this.client.transaction(async (trx) => {
      await preCreate(resource);

      const [created, ...extraCreated] = await trx(tableName)
        .insert<T>(resource)
        .returning('*');

      if (extraCreated.length > 0) {
        this.logger.error('multiple resource creations returned');
        throw new Error('multiple resource creations returned');
      }

      if (!created) {
        this.logger.error('no resource creation returned');
        throw new Error('no resource creation returned');
      }

      const authzPathExpression = this.createAuthzPathExpression(
        kind,
        namespace,
      );
      let query = trx(`${tableName} as r`)
        .select<T[]>('*')
        .andWhere('name', name);
      if (namespace) {
        query = query.andWhere('namespace', namespace);
      }

      query = this.addPermissionClauses(
        query,
        authzPathExpression,
        permissionRegexList,
      );

      const permissionResults = await query;

      if (permissionResults.length === 0) {
        throw new ForbiddenException(
          `Cannot create kind:[${kind}] resource name:[${name}] in namespace:[${namespace}]`,
        );
      }

      //TODO should post create block a creation?
      await postCreate(created, trx);
      return created;
    });
  }
}
