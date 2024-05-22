import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { ActorContext } from 'src/types/types';
import { CreateKind, Kind, UpdateKind } from './kinds.types';
import { KindDBRecord } from './kinds.types.record';

@Injectable()
export class KindService {
  private readonly logger = new Logger(KindService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async listKinds(actorContext: ActorContext): Promise<Kind[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<KindDBRecord>(
      Kind.kind,
      permissions,
    );

    return resp.map((r) => Kind.fromDBRecord(r));
  }

  async getKind(actorContext: ActorContext, name: string): Promise<Kind> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`Kind with name ${name} not found`);
    }

    const resp = await this.dbService.getResource(Kind.kind, permissions, name);
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Kind with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple kinds with name ${name}, using first`);
      throw new InternalServerErrorException('multiple kinds with same name');
    }
    return Kind.fromDBRecord(resp[0]);
  }

  async updateKind(
    kind: UpdateKind,
    actor: ActorContext,
    message: string,
  ): Promise<Kind> {
    //history etc

    const permissions = actor.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = kind.toDBRecord(actor, message);

    const resp = await this.dbService.updateResource<KindDBRecord>(
      Kind.kind,
      resource,
      permissions,
      async () => {},
      async () => {},
    );

    return Kind.fromDBRecord(resp);
  }

  async createKind(
    kind: CreateKind,
    actor: ActorContext,
    message?: string,
  ): Promise<Kind> {
    this.logger.debug('creating kind record', kind);

    const dbRecord = kind.toDBRecord(actor, message);

    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const record = await this.dbService.createResource(
      Kind.kind,
      dbRecord,
      permissions,
      async () => {},
      async (result, trx) =>
        this.createNamespacedKindTables(kind.metadata.name, trx),
    );

    return Kind.fromDBRecord(record);
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

    await trx.schema.createTable(`meta_${name}`, (table) => {
      commonFields(table);
      table.primary(['name', 'namespace']);
    });

    await trx.schema.createTable(`meta_${name}_history`, (table) => {
      commonFields(table);
      table.primary(['name', 'namespace', 'revision_id']);
      //make sure bugs can't update history?
      //might need to be able to delete history?
      trx.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
      trx.raw('REVOKE UPDATE ON meta_kind_history FROM optd');
    });
  }
}
