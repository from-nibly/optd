import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { Knex } from 'knex';
import { CreateSubject, Subject, UpdateSubject } from './subjects.types';
import { SubjectDBRecord } from './subjects.types.record';
import { ActorContext } from 'src/types/types';
import { HooksService } from 'src/hooks/hooks.service';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.dbService.client.transaction(async (trx) => {
      //TODO: do proper migrations here
      const tableName = this.dbService.getTableName(Subject.kind);
      const historyTableName = this.dbService.getHistoryTableName(Subject.kind);

      const tableExists = await trx.schema.hasTable(tableName);
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
        trx.raw('REVOKE UPDATE ON meta_subjects_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_subjects_history FROM optd');
      });
    });
  }

  async listSubjects(actorContext: ActorContext): Promise<Subject[]> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning empty list');
      return [];
    }

    const resp = await this.dbService.listResources<SubjectDBRecord>(
      Subject.kind,
      permissions,
    );

    return resp.map((r) => Subject.fromDBRecord(r));
  }

  async getSubjectInternal(name: string): Promise<Subject> {
    const resp = await this.dbService.getResource<SubjectDBRecord>(
      Subject.kind,
      ['.*'],
      name,
    );
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Subject with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(
        `found multiple Subjects with name ${name}, using first`,
      );
      throw new InternalServerErrorException(
        'multiple Subjects with same name',
      );
    }
    return Subject.fromDBRecord(resp[0]);
  }

  async getSubject(actorContext: ActorContext, name: string): Promise<Subject> {
    const permissions = actorContext.getPermissionPaths('list');

    //shortcut when there are no permissions
    if (permissions.length === 0) {
      this.logger.debug('no permissions, returning 404');
      throw new NotFoundException(`Subject with name ${name} not found`);
    }

    const resp = await this.dbService.getResource<SubjectDBRecord>(
      Subject.kind,
      permissions,
      name,
    );
    //error handling
    if (resp.length === 0) {
      throw new NotFoundException(`Subject with name ${name} not found`);
    }
    if (resp.length > 1) {
      this.logger.error(
        `found multiple Subjects with name ${name}, using first`,
      );
      throw new InternalServerErrorException(
        'multiple Subjects with same name',
      );
    }
    return Subject.fromDBRecord(resp[0]);
  }

  async createSubject(
    actor: ActorContext,
    record: CreateSubject,
    message: string,
  ): Promise<Subject> {
    const permissions = actor.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<SubjectDBRecord>(
      Subject.kind,
      record.toDBRecord(actor, message),
      permissions,
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook('preCreate', Subject.kind, newRecord);
      },
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook('postCreate', Subject.kind, newRecord);
      },
    );

    return Subject.fromDBRecord(created);
  }

  async updateSubject(
    actorContext: ActorContext,
    record: UpdateSubject,
    message: string,
  ): Promise<Subject> {
    const permissions = actorContext.getPermissionPaths('update');

    if (permissions.length === 0) {
      throw new ForbiddenException('No update permissions found');
    }

    const resource = record.toDBRecord(actorContext, message);

    const updated = await this.dbService.updateResource<SubjectDBRecord>(
      Subject.kind,
      resource,
      permissions,
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook('preUpdate', Subject.kind, newRecord);
      },
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook('postUpdate', Subject.kind, newRecord);
      },
    );

    return Subject.fromDBRecord(updated);
  }
}
