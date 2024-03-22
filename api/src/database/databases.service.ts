import { Injectable } from '@nestjs/common';

import * as knex from 'knex';

const tableNames = {
  'kind-tables': 'kind_tables',
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

  async getResourceTables() {}

  getTableName(key: TableName) {
    return tableNames[key];
  }
}
