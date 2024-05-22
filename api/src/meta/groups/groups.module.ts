import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { GroupService } from './groups.service';
import { GroupController } from './groups.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupsModule {}
