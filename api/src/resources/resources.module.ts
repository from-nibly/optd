import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ResourceNamespacedController } from './resources.namespaced.controller';
import { ResourceService } from './resources.service';
import { HooksModule } from 'src/hooks/hooks.module';
import { ResourceController } from './resources.controller';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [ResourceNamespacedController, ResourceController],
  providers: [ResourceService],
})
export class ResourcesModule {}
