import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/databases.module';
import { HooksModule } from './hooks/hooks.module';
import { KindModule } from './meta/kinds/kinds.module';
import { ResourcesModule } from './resources/resources.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { RolesModule } from './roles/roles.module';
import { GroupsModule } from './groups/groups.module';
import { AuthorizationModule } from './authorization/authorization.module';

@Module({
  imports: [
    KindModule,
    DatabaseModule,
    ResourcesModule,
    HooksModule,
    AuthenticationModule,
    AuthorizationModule,
    SubjectsModule,
    RolesModule,
    GroupsModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
