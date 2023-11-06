import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database/databases.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    const kinds = await this.databaseService.metaDB.allDocs({
      startkey: 'kind/',
      endkey: 'kind/{}',
      include_docs: true,
    });

    for (const doc of kinds.rows) {
      const name = doc.id.split('/')[1];
      this.logger.debug(`initializing database ${name}`);
      this.databaseService.initDatabase(name);
      //Initialize hooks?
    }
  }
}
