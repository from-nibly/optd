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
import { HooksService } from 'src/hooks/hooks.service';
import { MigrationService } from 'src/database/migrations/migrations.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class KindService {
  private readonly logger = new Logger(KindService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.migrationService.addMetaTablesMigration(Kind.kind, Kind.kind);

    const tableName = this.dbService.getTableName(Kind.kind);
    const tableExists = await this.dbService.client.schema.hasTable(tableName);
    if (!tableExists) {
      return;
    }
    const kinds = (await this.listKindsInternal()).filter(
      (res) => !res.spec.is_meta,
    );

    for (const kind of kinds) {
      this.logger.debug('creating table for kind', kind.metadata.name);
      this.migrationService.addResourceTablesMigration(
        kind.metadata.name,
        kind.metadata.name,
      );
    }
  }

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.dbService.getResourceInternal(
      Kind.kind,
      Kind.kind,
    );
    if (!result || result.length == 0) {
      await this.dbService.createResourceInternal(
        Kind.kind,
        {
          name: Kind.kind,
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

  async listKindsInternal(): Promise<Kind[]> {
    const resp = await this.dbService.listResourcesInternal<KindDBRecord>(
      Kind.kind,
    );

    return resp.map((r) => Kind.fromDBRecord(r));
  }

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

    const resp = await this.dbService.getResource<KindDBRecord>(
      Kind.kind,
      permissions,
      name,
    );
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

    const record = await this.dbService.createResource<KindDBRecord>(
      Kind.kind,
      dbRecord,
      permissions,
      async () => {},
      async (result, trx) => {
        this.migrationService.addResourceTablesMigration(
          kind.metadata.name,
          kind.metadata.name,
        );
        await this.migrationService.triggerMigrations();
      },
    );

    return Kind.fromDBRecord(record);
  }
}
