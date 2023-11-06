import { Injectable } from '@nestjs/common';
import * as PouchDB from 'pouchdb';
import { KindRecord } from 'src/kinds/kind.types.record';
import { Optional } from 'src/utils.types';

@Injectable()
export class DatabaseService {
  public readonly metaDB: PouchDB.Database<
    Optional<Optional<KindRecord, '_rev'>, 'status'>
  >;

  constructor() {
    this.metaDB = new PouchDB<KindRecord>('./db/meta');
  }
}
