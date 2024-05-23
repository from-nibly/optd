import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseService } from 'src/database/databases.service';
import { HooksService } from 'src/hooks/hooks.service';
import { ActorContext } from 'src/types/types';
import { CreateCron, Cron, UpdateCron } from './crons.types';
import { CronDBRecord } from './crons.types.record';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.dbService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableName = this.dbService.getTableName(Cron.kind);
      const historyTableName = this.dbService.getHistoryTableName('crons');
      const tableExists = await trx.schema.hasTable(tableName);
      this.logger.debug('tableExists', tableExists);
      if (tableExists) {
        return;
      }

      const commonFields = (table: Knex.CreateTableBuilder) => {
        table.string('name', 255).checkRegex('^[a-z][a-z0-9-]*$').notNullable();

        // unstructured in database
        table.jsonb('metadata_annotations').notNullable();
        table.jsonb('metadata_labels').notNullable();
        table.jsonb('status').notNullable();

        //single string to represent current state
        table
          .string('state', 255)
          .checkRegex('^[a-z][a-z0-9-]*$')
          .notNullable();

        //spec is unstructured
        table.jsonb('spec').notNullable();

        //history
        table.uuid('revision_id').notNullable();
        table.datetime('revision_at', { useTz: true }).notNullable();
        table.string('revision_by', 255).notNullable();
        table.text('revision_message').nullable();
        table.uuid('revision_parent').nullable();
      };

      await trx.schema.createTable(tableName, (table) => {
        commonFields(table);
        table.primary(['name']);
      });

      await trx.schema.createTable(historyTableName, (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        trx.raw(`REVOKE UPDATE ON ${historyTableName} FROM optd`);
        trx.raw(`REVOKE UPDATE ON ${historyTableName} FROM optd`);
      });
    });
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
    actor: ActorContext,
    record: CreateCron,
    message: string,
  ): Promise<Cron> {
    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<CronDBRecord>(
      Cron.kind,
      record.toDBRecord(actor, message),
      permissions,
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook('preCreate', Cron.kind, newRecord);
      },
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook('postCreate', Cron.kind, newRecord);
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
        this.hookService.executeHook('preUpdate', Cron.kind, newRecord);
      },
      async (result) => {
        const newRecord = Cron.fromDBRecord(result);
        this.hookService.executeHook('postUpdate', Cron.kind, newRecord);
      },
    );

    return Cron.fromDBRecord(updated);
  }
}
