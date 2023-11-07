import { Injectable } from '@nestjs/common';
import * as PouchDB from 'pouchdb';
import { KindRecord } from 'src/meta/kinds/kinds.types.record';
import { ResourceRecord } from 'src/resources/resources.types.record';
import { Optional } from 'src/utils.types';

@Injectable()
export class DatabaseService {
  public readonly kindDB: PouchDB.Database<Optional<KindRecord, '_rev'>>;
  private readonly dynamicDatabases: Record<
    string,
    PouchDB.Database<Optional<ResourceRecord, '_rev'>>
  > = {};

  constructor() {
    this.kindDB = new PouchDB<KindRecord>('./db/meta_kinds');
  }

  initDatabase(name: string) {
    this.dynamicDatabases[name] = new PouchDB(`./db/resources_${name}`);
  }

  getDatabase(name: string) {
    return this.dynamicDatabases[name];
  }
}
