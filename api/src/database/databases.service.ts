import { Injectable } from '@nestjs/common';

import * as knex from 'knex';

@Injectable()
export class DatabaseService {
  private knex: knex.Knex<any, any> | undefined;

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

  getResourceTableName(resourceName: string) {
    return `resource_${resourceName}`;
  }

  getResourceHistoryTableName(resourceName: string) {
    return `resource_${resourceName}_history`;
  }
}
