import { Module } from '@nestjs/common';
import { KindController } from './kinds.controller';
import { KindService } from './kinds.service';
import { DatabaseModule } from 'src/database/databases.module';
import { HooksModule } from 'src/hooks/hooks.module';
import { MigrationModule } from 'src/database/migrations/migrations.module';

@Module({
  imports: [DatabaseModule, HooksModule, MigrationModule],
  controllers: [KindController],
  providers: [KindService],
})
export class KindModule {}
