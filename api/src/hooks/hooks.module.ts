import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { DatabaseModule } from 'src/database/databases.module';
import { ExecutorModule } from 'src/executor/executor.module';

@Module({
  imports: [DatabaseModule, ExecutorModule],
  controllers: [],
  providers: [HooksService],
  exports: [HooksService],
})
export class HooksModule {}
