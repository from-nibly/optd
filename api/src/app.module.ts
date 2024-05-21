import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/databases.module';
import { HooksModule } from './hooks/hooks.module';
import { KindModule } from './meta/kinds/kinds.module';
import { MetaModule } from './meta/meta.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    KindModule,
    DatabaseModule,
    ResourcesModule,
    HooksModule,
    AuthenticationModule,
    AuthorizationModule,
    MetaModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
