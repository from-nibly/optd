import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { DatabaseModule } from 'src/database/databases.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [HooksService],
  exports: [HooksService],
})
export class HooksModule {}
