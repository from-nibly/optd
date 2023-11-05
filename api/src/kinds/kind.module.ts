import { Module } from '@nestjs/common';
import { KindController } from './kind.controller';
import { KindService } from './kind.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KindController],
  providers: [KindService],
})
export class KindModule {}
