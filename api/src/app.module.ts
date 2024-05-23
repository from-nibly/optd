import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/databases.module';
import { HooksModule } from './hooks/hooks.module';
import { KindModule } from './meta/kinds/kinds.module';
import { ResourcesModule } from './resources/resources.module';
import { SubjectsModule } from './meta/subjects/subjects.module';
import { GroupsModule } from './meta/groups/groups.module';
import { RolesModule } from './meta/roles/roles.module';
import { CronsModule } from './meta/crons/crons.module';

@Module({
  imports: [
    KindModule,
    DatabaseModule,
    ResourcesModule,
    HooksModule,
    AuthenticationModule,
    AuthorizationModule,
    SubjectsModule,
    GroupsModule,
    RolesModule,
    CronsModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
