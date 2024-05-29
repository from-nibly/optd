import { Module } from '@nestjs/common';
import { MigrationService } from './migrations.service';
import { DatabaseModule } from '../databases.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
