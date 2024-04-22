import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { DatabaseModule } from './database/databases.module';
import { HooksModule } from './hooks/hooks.module';
import { KindModule } from './meta/kinds/kinds.module';
import { ResourcesModule } from './resources/resources.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    KindModule,
    DatabaseModule,
    ResourcesModule,
    HooksModule,
    AuthenticationModule,
    SubjectsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
