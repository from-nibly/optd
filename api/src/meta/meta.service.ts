import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { Permission } from 'src/meta/roles/roles.types';
import { ActorContext } from 'src/types/types';
import { CreateMeta, Meta, UpdateMeta } from './meta.types';
import { MetaDBRecord } from './meta.types.record';

@Injectable()
export class MetaResourceService {
  private readonly logger = new Logger(MetaResourceService.name);

  constructor(private readonly dbService: DatabaseService) {}

  private createAuthzPathExpression(client: Knex, kind: string) {
    return client.raw(`CONCAT('/meta/${kind}/', r.name)`);
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

  async listMetaResources(
    actorContext: ActorContext,
    kind: string,
  ): Promise<Meta[]> {
    const tableName = this.dbService.getMetaResourceTableName(kind);
    const client = this.dbService.client;

    const permissions = actorContext.getPermissions('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    let query = client(`${tableName} as r`).select<MetaDBRecord[]>('*');

    const authzPathExpression = this.createAuthzPathExpression(client, 'meta');
    query = this.addPermissionClauses(query, authzPathExpression, permissions);

    const resp = await query;
    this.logger.debug(`got ${kind} through meta service`, { resp });

    return resp.map((r) => Meta.fromDBRecord(r, kind));
  }

  async getMetaResource(
    actorContext: ActorContext,
    kind: string,
    name: string,
  ): Promise<Meta> {
    const tableName = this.dbService.getMetaResourceTableName(kind);
    const client = this.dbService.client;

    const permissions = actorContext.getPermissions('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`${kind} with name ${name} not found`);
    }

    let query = this.dbService
      .client(tableName)
      .select<MetaDBRecord[]>('*')
      .where('name', name);

    const authzPathExpression = this.createAuthzPathExpression(client, kind);
    query = this.addPermissionClauses(query, authzPathExpression, permissions);

    const resp = await query;
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`${kind} with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple ${kind} resources with name ${name}`);
      throw new InternalServerErrorException(
        `multiple ${kind} resources with same name`,
      );
    }
    return Meta.fromDBRecord(resp[0], kind);
  }

  async updateMetaResource(
    actor: ActorContext,
    kind: string,
    meta: UpdateMeta,
    message: string,
  ): Promise<Meta> {
    //history etc
    return this.dbService.client.transaction(async (trx) => {
      const tableName = this.dbService.getMetaResourceTableName(kind);
      const historyTableName =
        this.dbService.getMetaResourceHistoryTableName(kind);
      const [existing, ...extra] = await trx(tableName)
        .select<MetaDBRecord[]>('*')
        .where('name', meta.metadata.name);

      if (extra.length > 0) {
        this.logger.error(
          `found multiple ${kind} resources with name ${meta.metadata.name}`,
        );
        throw new Error(`multiple ${kind} resources with same name`);
      }

      if (!existing) {
        throw new NotFoundException(
          `Meta with name ${meta.metadata.name} not found`,
        );
      }

      await trx(historyTableName).insert(existing);
      await trx(tableName).where('name', meta.metadata.name).del();
      const [updated, ...extraUpdate] = await trx(tableName)
        .insert<MetaDBRecord>(
          meta.toDBRecord(
            actor,
            //this must come from the request (and not the current db state) otherwise the database optimistic locking wont work
            meta.history.id,
            message,
          ),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error(`multiple ${kind} updates returned`);
        throw new Error(`multiple ${kind} updates returned`);
      }
      if (!updated) {
        this.logger.error(`no ${kind} update returned`);
        throw new Error(`no ${kind} update returned`);
      }

      return Meta.fromDBRecord(updated, kind);
    });
  }

  async createMetaResource(
    actor: ActorContext,
    kind: string,
    meta: CreateMeta,
    message?: string,
  ): Promise<Meta> {
    const tableName = this.dbService.getMetaResourceTableName(kind);
    this.logger.debug('creating meta record', meta);

    const dbRecord = meta.toDBRecord(actor, message);
    return this.dbService.client.transaction(async (trx) => {
      const resp = await trx(tableName)
        .insert<MetaDBRecord>(dbRecord)
        .returning('*');

      return Meta.fromDBRecord(resp[0], kind);
    });
  }
}
