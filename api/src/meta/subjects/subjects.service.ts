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
import { MigrationService } from 'src/database/migrations/migrations.service';
import { Kind } from '../kinds/kinds.types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly hookService: HooksService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.migrationService.addMetaTablesMigration(Subject.kind, Subject.kind);
  }

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.dbService.getResourceInternal(
      Kind.kind,
      Subject.kind,
    );
    if (!result || result.length == 0) {
      await this.dbService.createResourceInternal(
        Kind.kind,
        {
          name: Subject.kind,
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
    actorContext: ActorContext,
    record: CreateSubject,
    message: string,
  ): Promise<Subject> {
    const permissions = actorContext.getPermissionPaths('create');

    if (permissions.length === 0) {
      throw new ForbiddenException('No create permissions found');
    }

    const created = await this.dbService.createResource<SubjectDBRecord>(
      Subject.kind,
      record.toDBRecord(actorContext, message),
      permissions,
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Subject.kind,
          'preCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);

        this.hookService.executeHook(
          actorContext,
          Subject.kind,
          'postCreate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
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
        this.hookService.executeHook(
          actorContext,
          Subject.kind,
          'preUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
      async (result) => {
        const newRecord = Subject.fromDBRecord(result);
        this.hookService.executeHook(
          actorContext,
          Subject.kind,
          'postUpdate',
          { payload: newRecord },
          newRecord.metadata.name,
        );
      },
    );

    return Subject.fromDBRecord(updated);
  }
}
