import { Logger, Module } from '@nestjs/common';
import { DatabaseService } from './databases.service';
import { Kind } from 'src/meta/kinds/kinds.types';

@Module({
  imports: [],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly db: DatabaseService) {}
}
