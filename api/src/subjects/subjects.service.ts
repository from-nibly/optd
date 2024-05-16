import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/databases.service';
import { Knex } from 'knex';
import { CreateSubject, Subject, UpdateSubject } from './subjects.types';
import { SubjectDBRecord } from './subjects.types.record';
import { ActorContext } from 'src/types/types';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    //migrations
    this.databaseService.client.transaction(async (trx) => {
      //check if table exists
      //TODO: do proper migrations here
      const tableExists = await trx.schema.hasTable('meta_subject');
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

      await trx.schema.createTable('meta_subject', (table) => {
        commonFields(table);
        table.primary(['name']);
      });

      await trx.schema.createTable('meta_subject_history', (table) => {
        commonFields(table);
        table.primary(['name', 'revision_id']);
        //make sure bugs can't update history?
        //might need to be able to delete history?
        trx.raw('REVOKE UPDATE ON meta_subject_history FROM optd');
        trx.raw('REVOKE UPDATE ON meta_subject_history FROM optd');
      });
    });
  }

  async listSubjects(): Promise<Subject[]> {
    const resp = await this.databaseService
      .client('meta_subject')
      .select<SubjectDBRecord[]>('*');
    return resp.map((record) => Subject.fromDBRecord(record));
  }

  async getSubject(id: string): Promise<Subject> {
    const resp = await this.databaseService
      .client('meta_subject')
      .where('name', id)
      .select<SubjectDBRecord[]>('*');
    if (resp.length === 0) {
      throw new Error('subject not found');
    }
    if (resp.length > 1) {
      throw new Error('multiple subjects with same id');
    }
    return Subject.fromDBRecord(resp[0]);
  }

  async createSubject(
    subject: CreateSubject,
    actor: ActorContext,
    message?: string,
  ): Promise<Subject> {
    this.logger.debug('creating subject record', subject);

    const dbRecord = subject.toDBRecord(actor, message);

    return this.databaseService.client.transaction(async (trx) => {
      const resp = await trx('meta_subject')
        .insert<SubjectDBRecord>(dbRecord)
        .returning('*');

      return Subject.fromDBRecord(resp[0]);
    });
  }

  async updateSubject(
    subject: UpdateSubject,
    actor: ActorContext,
    message?: string,
  ): Promise<Subject> {
    return this.databaseService.client.transaction(async (trx) => {
      const [existing, ...extra] = await trx('meta_subject')
        .select('*')
        .where('name', subject.metadata.name);
      if (extra.length > 0) {
        this.logger.error(
          `found multiple subjects with name ${subject.metadata.name}`,
        );
        throw new Error('multiple subjects with same name');
      }
      if (!existing) {
        throw new Error('subject not found');
      }

      await trx('meta_subject_history').insert(existing);
      await trx('meta_subject').where('name', subject.metadata.name).del();
      const [updated, ...extraUpdate] = await trx('meta_subject')
        .insert<SubjectDBRecord>(
          subject.toDBRecord(actor, existing.revision_id, message),
        )
        .returning('*');
      if (extraUpdate.length > 0) {
        this.logger.error('multiple subject updates returned');
        throw new Error('multiple subject updates returned');
      }
      if (!updated) {
        this.logger.error('no subject update returned');
        throw new Error('no subject update returned');
      }

      return Subject.fromDBRecord(updated);
    });
  }
}
