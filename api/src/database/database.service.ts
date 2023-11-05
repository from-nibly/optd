import { Injectable } from '@nestjs/common';
import * as PouchDB from 'pouchdb';
import { KindRecord } from 'src/kinds/kind.types';

@Injectable()
export class DatabaseService {
  public readonly metaDB: PouchDB.Database<KindRecord>;

  constructor() {
    this.metaDB = new PouchDB<KindRecord>('./db/meta');
  }
}
