import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/databases.module';
import { HooksModule } from './hooks/hooks.module';
import { KindModule } from './meta/kinds/kinds.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    KindModule,
    DatabaseModule,
    ResourcesModule,
    HooksModule,
    AuthenticationModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
