import { Module } from '@nestjs/common';
import { DatabaseService } from './databases.service';

@Module({
  imports: [],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    this.db.client(this.db.getTableName('kind-tables')).select('*');
  }
}
