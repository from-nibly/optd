import { Injectable } from '@nestjs/common';
import * as PouchDB from 'pouchdb';
import { KindRecord } from 'src/meta/kinds/kinds.types.record';
import { ResourceRecord } from 'src/resources/resources.types.record';
import { SubjectRecord } from 'src/subjects/subjects.types.record';
import { Optional } from 'src/utils.types';

@Injectable()
export class DatabaseService {
  public readonly default: any;
  public readonly kindDB: PouchDB.Database<Optional<KindRecord, '_rev'>>;
  public readonly subjectDB: PouchDB.Database<Optional<SubjectRecord, '_rev'>>;

  private readonly dynamicDatabases: Record<
    string,
    PouchDB.Database<Optional<ResourceRecord, '_rev'>>
  > = {};

  constructor() {
    this.default = PouchDB.defaults({ prefix: './db/' });
    this.kindDB = new this.default('meta_kinds');
    this.subjectDB = new this.default('meta_subjects');
  }

  initDatabase(name: string) {
    this.dynamicDatabases[name] = new this.default(`resources_${name}`);
  }

  getDatabase(name: string) {
    return this.dynamicDatabases[name];
  }
}
