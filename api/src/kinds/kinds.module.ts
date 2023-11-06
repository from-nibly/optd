import { Module } from '@nestjs/common';
import { KindController } from './kinds.controller';
import { KindService } from './kinds.service';
import { DatabaseModule } from 'src/database/databases.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KindController],
  providers: [KindService],
})
export class KindModule {}
