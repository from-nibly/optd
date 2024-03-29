import { Injectable } from '@nestjs/common';

import * as knex from 'knex';

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

  getKindTableName(resourceName: string) {
    return `resource_${resourceName}`;
  }

  getKindHistoryTableName(resourceName: string) {
    return `resource_${resourceName}_history`;
  }
}
