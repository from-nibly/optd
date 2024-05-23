import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { CronService } from './crons.service';
import { CronController } from './crons.controller';
import { HooksModule } from 'src/hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronsModule {}
