import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { MigrationModule } from 'src/database/migrations/migrations.module';
import { HooksModule } from 'src/hooks/hooks.module';
import { RoleController } from './roles.controller';
import { RoleService } from './roles.service';

@Module({
  imports: [DatabaseModule, HooksModule, MigrationModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
