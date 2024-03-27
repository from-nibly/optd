import { Injectable } from '@nestjs/common';

import * as knex from 'knex';
import { addAbortSignal } from 'stream';

const tableNames = {
  'kind-tables': {
    name: 'meta_kind',
    history: 'meta_kind_history',
  },
};

type TableName = keyof typeof tableNames;

@Injectable()
export class DatabaseService {
  private knex: knex.Knex;

  constructor() {}

  get client() {
    if (!this.knex) {
      this.knex = knex({
        client: 'pg',
        connection: {
          host: 'localhost',
          user: 'optd',
          password: 'foobar',
          database: 'optd',
        },
      });
    }
    return this.knex;
  }

  async getKindTables() {}

  getTableName(key: TableName) {
    return tableNames[key];
  }
}
