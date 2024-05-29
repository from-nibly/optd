import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ExecutorService } from './executor.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [ExecutorService],
  exports: [ExecutorService],
})
export class ExecutorModule {}
