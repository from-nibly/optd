import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ExecutorModule } from 'src/executor/executor.module';
import { JobsService } from './jobs.service';

@Module({
  imports: [DatabaseModule, ExecutorModule],
  controllers: [],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {
  constructor() {}

  async onModuleInit() {}
}
