import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { RoleService } from './roles.service';
import { RoleController } from './roles.controller';
import { HooksModule } from 'src/hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
