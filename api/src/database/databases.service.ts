import { Injectable } from '@nestjs/common';
import * as PouchDB from 'pouchdb';
import { KindRecord } from 'src/kinds/kinds.types.record';
import { ResourceRecord } from 'src/resources/resources.types.record';
import { Optional } from 'src/utils.types';

@Injectable()
export class DatabaseService {
  public readonly metaDB: PouchDB.Database<Optional<KindRecord, '_rev'>>;
  private readonly dynamicDatabases: Record<
    string,
    PouchDB.Database<Optional<ResourceRecord, '_rev'>>
  > = {};

  constructor() {
    this.metaDB = new PouchDB<KindRecord>('./db/meta');
  }

  initDatabase(name: string) {
    this.dynamicDatabases[name] = new PouchDB(`./db/resources_${name}`);
  }

  getDatabase(name: string) {
    return this.dynamicDatabases[name];
  }
}
