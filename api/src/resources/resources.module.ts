import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ResourceController } from './resources.controller';
import { ResourceService } from './resources.service';
import { HooksModule } from 'src/hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourcesModule {}
