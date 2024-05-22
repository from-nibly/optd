import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { SubjectService } from './subjects.service';
import { SubjectController } from './subjects.controller';
import { HooksModule } from 'src/hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectsModule {}
