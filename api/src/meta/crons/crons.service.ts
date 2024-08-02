import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { MigrationService } from 'src/database/migrations/migrations.service';
import { HooksService } from 'src/hooks/hooks.service';
import { JobsService } from 'src/jobs/jobs.service';
import { ActorContext } from 'src/types/types';
import { CreateCron, Cron, UpdateCron } from './crons.types';
import { CronDBRecord } from './crons.types.record';
import { Kind } from '../kinds/kinds.types';
import { v4 as uuid } from 'uuid';

//TODO: should crons be global or namespaced?
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
    private readonly jobService: JobsService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.migrationService.addMetaTablesMigration(Cron.kind, Cron.kind);
  }

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.dbService.getResourceInternal(
      Kind.kind,
      Cron.kind,
    );
    if (!result || result.length == 0) {
      await this.dbService.createResourceInternal(
        Kind.kind,
        {
          name: Cron.kind,
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

  async listCrons(actorContext: ActorContext): Promise<Cron[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<CronDBRecord>(
      Cron.kind,
      permissions,
    );

    return resp.map((r) => Cron.fromDBRecord(r));
  }

  async getAllCronsInternal(names: string[]): Promise<Cron[]> {
    const resp = await this.dbService
      .client(this.dbService.getTableName(Cron.kind))
      .whereIn('name', names)
      .select<CronDBRecord[]>('*');
    return resp.map((record) => Cron.fromDBRecord(record));
  }

  async getCron(actorContext: ActorContext, name: string): Promise<Cron> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`Cron with name ${name} not found`);
    }

    const resp = await this.dbService.getResource<CronDBRecord>(
      Cron.kind,
      permissions,
      name,
    );
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Cron with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(`found multiple Cron with name ${name}, using first`);
      throw new InternalServerErrorException('multiple Cron with same name');
    }
    return Cron.fromDBRecord(resp[0]);
  }

  async createCron(
    actorContext: ActorContext,
    record: CreateCron,
    message: string,
  ): Promise<Cron> {
    const permissions = actorContext.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<CronDBRecord>(
      Cron.kind,
      record.toDBRecord(actorContext, message),
      permissions,
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Cron.kind,
          'preCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);

        this.hookService.executeHook(
          actorContext,
          Cron.kind,
          'postCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
    );

    return Cron.fromDBRecord(created);
  }

  async updateCron(
    actorContext: ActorContext,
    record: UpdateCron,
    message: string,
  ): Promise<Cron> {
    const permissions = actorContext.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = record.toDBRecord(actorContext, message);

    const updated = await this.dbService.updateResource<CronDBRecord>(
      Cron.kind,
      resource,
      permissions,
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Cron.kind,
          'preUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Cron.kind,
          'postUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
    );

    const rtn = Cron.fromDBRecord(updated);

    await this.jobService.unscheduleCron(rtn);

    await this.jobService.scheduleCron(rtn);

    return rtn;
  }
}
