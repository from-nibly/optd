import { Injectable, Logger, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseService } from './database/databases.service';
import { HooksService } from './hooks/hooks.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hooksService: HooksService,
  ) {}

  async onModuleInit(): Promise<void> {
    const kinds = await this.databaseService.kindDB.allDocs({
      startkey: 'kind/',
      endkey: 'kind/{}',
      include_docs: true,
    });

    for (const doc of kinds.rows) {
      const name = doc.id.split('/')[1];
      this.logger.debug(`initializing database ${name}`);
      this.databaseService.initDatabase(name);

      const kindRecord = doc.doc!;

      this.hooksService.configureHooks(
        name,
        kindRecord._rev,
        kindRecord.spec.hooks,
      );
    }
  }
}
