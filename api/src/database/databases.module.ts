import { Logger, Module } from '@nestjs/common';
import { DatabaseService } from './databases.service';

@Module({
  imports: [],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    const results = await this.db.client('meta_kind').select('*');

    this.logger.debug('DatabaseModule initialized', { results });
  }
}
