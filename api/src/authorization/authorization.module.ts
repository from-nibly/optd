import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GroupsModule } from 'src/groups/groups.module';
import { RolesModule } from 'src/roles/roles.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { AuthorizationGuard } from './authorization.guard';

@Module({
  imports: [SubjectsModule, RolesModule, GroupsModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthorizationGuard }],

  exports: [],
})
export class AuthorizationModule {}
