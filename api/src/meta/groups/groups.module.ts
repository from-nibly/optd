import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { HooksModule } from 'src/hooks/hooks.module';
import { GroupController } from './groups.controller';
import { GroupService } from './groups.service';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupsModule {}
