import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { KindModule } from './kinds/kinds.module';
import { DatabaseModule } from './database/databases.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [KindModule, DatabaseModule, ResourcesModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
