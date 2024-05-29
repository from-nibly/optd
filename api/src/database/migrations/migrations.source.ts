import { Knex } from 'knex';

export interface Migration {
  name: string;
  up(knex: Knex): Promise<void>;
  down(knex: Knex): Promise<void>;
}

export class KnexMigrationSource implements Knex.MigrationSource<unknown> {
  private readonly migrations: Record<string, Migration> = {};

  async getMigrations(): Promise<unknown[]> {
    return Object.keys(this.migrations).sort();
  }

  getMigrationName(migration: string): string {
    return migration;
  }

  async getMigration(migration: unknown): Promise<Migration> {
    return this.migrations[migration as string];
  }

  addMigrations(batchName: string, migrations: Migration[]) {
    // is this going to work?
    migrations.forEach((migration, index) => {
      const indexNumber = (index + '').padStart(5, '0');
      const name = `${batchName}_${indexNumber}_${migration.name}`;
      this.migrations[name] = migration;
    });
  }
}
