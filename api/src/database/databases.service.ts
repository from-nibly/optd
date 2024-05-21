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

  getMetaResourceTableName(resourceKind: string): string {
    return `meta_${resourceKind}`;
  }

  getMetaResourceHistoryTableName(resourceKind: string): string {
    return `meta_${resourceKind}_history`;
  }

  getResourceTableName(resourceKind: string) {
    return `resource_${resourceKind}`;
  }

  getResourceHistoryTableName(resourceKind: string) {
    return `resource_${resourceKind}_history`;
  }
}
