import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { CronService } from './crons.service';
import { CronController } from './crons.controller';
import { HooksModule } from 'src/hooks/hooks.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [DatabaseModule, HooksModule, JobsModule],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronsModule {}
