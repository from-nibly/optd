import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { MigrationModule } from 'src/database/migrations/migrations.module';
import { HooksModule } from 'src/hooks/hooks.module';
import { SubjectController } from './subjects.controller';
import { SubjectService } from './subjects.service';

@Module({
  imports: [DatabaseModule, HooksModule, MigrationModule],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectsModule {}
