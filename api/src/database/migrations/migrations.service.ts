import { Injectable, Logger } from '@nestjs/common';
import { KnexMigrationSource } from './migrations.source';
import { generateMetaMigrations } from './meta.migrations';
import { DatabaseService } from '../databases.service';
import { generateResourceMigrations } from './resources.migrations';

@Injectable()
export class MigrationService {
  migrationSource = new KnexMigrationSource();
  logger = new Logger(MigrationService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onApplicationBootstrap() {
    //run gathered migrations
    this.databaseService.client.migrate.latest({
      migrationSource: this.migrationSource,
    });
  }

  async addMetaTablesMigration(batchName: string, resourceName: string) {
    const migrations = generateMetaMigrations(resourceName);
    this.migrationSource.addMigrations(batchName, migrations);
  }

  async addResourceTablesMigration(batchName: string, resourceName: string) {
    const migrations = generateResourceMigrations(resourceName);
    this.migrationSource.addMigrations(batchName, migrations);
  }
}
