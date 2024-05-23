import { Logger, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { JobsService } from './jobs.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {
  private readonly logger = new Logger(JobsModule.name);

  constructor() {}

  async onModuleInit() {}
}
