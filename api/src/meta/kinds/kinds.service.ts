import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { Permission } from 'src/roles/roles.types';
import { ActorContext } from 'src/types/types';
import { CreateKind, Kind, UpdateKind } from './kinds.types';
import { KindDBRecord } from './kinds.types.record';

@Injectable()
export class KindService {
  private readonly logger = new Logger(KindService.name);

  constructor(private readonly dbService: DatabaseService) {}

  private createAuthzPathExpression(client: Knex, kind: string) {
    return client.raw(`CONCAT('/global/${kind}/', r.name)`);
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

  async listKinds(actorContext: ActorContext): Promise<Kind[]> {
    const tableName = 'meta_kind';
    const client = this.dbService.client;

    const permissions = actorContext.getPermissions('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const authzPathExpression = this.createAuthzPathExpression(client, 'kind');
    let query = client(tableName).select<KindDBRecord[]>('*');

    query = this.addPermissionClauses(query, authzPathExpression, permissions);

    const resp = await query;

    return resp.map((r) => Kind.fromDBRecord(r));
  }

  async getKind(name: string): Promise<Kind> {
    const resp = await this.dbService
      .client('meta_kind')
      .select<KindDBRecord[]>('*')
      .where('name', name);
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Kind with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple kinds with name ${name}, using first`);
      throw new Error('multiple kinds with same name');
    }
    return Kind.fromDBRecord(resp[0]);
  }

  async updateKind(
    kind: UpdateKind,
    actor: ActorContext,
    message: string,
  ): Promise<Kind> {
    //history etc
    return this.dbService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx('meta_kind')
        .select<KindDBRecord[]>('*')
        .where('name', kind.metadata.name);

      if (extra.length > 0) {
        this.logger.error(
          `found multiple kinds with name ${kind.metadata.name}`,
        );
        throw new Error('multiple kinds with same name');
      }

      if (!existing) {
        throw new NotFoundException(
          `Kind with name ${kind.metadata.name} not found`,
        );
      }

      await trx('meta_kind_history').insert(existing);
      await trx('meta_kind').where('name', kind.metadata.name).del();
      const [updated, ...extraUpdate] = await trx('meta_kind')
        .insert<KindDBRecord>(
          kind.toDBRecord(
            actor,
            //this must come from the request (and not the current db state) otherwise the database optimistic locking wont work
            kind.history.id,
            message,
          ),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error('multiple kind updates returned');
        throw new Error('multiple kind updates returned');
      }
      if (!updated) {
        this.logger.error('no kind update returned');
        throw new Error('no kind update returned');
      }

      return Kind.fromDBRecord(updated);
    });
  }

  async createKind(
    kind: CreateKind,
    actor: ActorContext,
    message?: string,
  ): Promise<Kind> {
    this.logger.debug('creating kind record', kind);

    const dbRecord = kind.toDBRecord(actor, message);
    return this.dbService.client.transaction(async (trx) => {
      const resp = await trx('meta_kind')
        .insert<KindDBRecord>(dbRecord)
        .returning('*');

      await this.createNamespacedKindTables(kind.metadata.name, trx);

      return Kind.fromDBRecord(resp[0]);
    });
  }

  private async createNamespacedKindTables(
    name: string,
    trx: Knex.Transaction,
  ) {
    const commonFields = (table: Knex.CreateTableBuilder) => {
      table.string('name', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();
      table
        .string('namespace', 255)
        .checkRegex('^[a-z][a-z0-9-]*$')
        .notNullable();

      // unstructured in database
      table.jsonb('metadata_annotations').notNullable();
      table.jsonb('metadata_labels').notNullable();
      table.jsonb('status').notNullable();

      //single string to represent current state
      table.string('state', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();

      //spec is unstructured
      table.jsonb('spec').notNullable();

      //history
      table.uuid('revision_id').notNullable();
      table.datetime('revision_at', { useTz: true }).notNullable();
      table.string('revision_by', 255).notNullable();
      table.text('revision_message').nullable();
      table.uuid('revision_parent').nullable();
    };

    await trx.schema.createTable(`resource_${name}`, (table) => {
      commonFields(table);
      table.primary(['name', 'namespace']);
    });

    await trx.schema.createTable(`resource_${name}_history`, (table) => {
      commonFields(table);
      table.primary(['name', 'namespace', 'revision_id']);
      //make sure bugs can't update history?
      //might need to be able to delete history?
      trx.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
      trx.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
    });
  }
}
