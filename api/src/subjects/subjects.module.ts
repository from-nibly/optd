import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { SubjectService } from './subjects.service';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectsModule {}
