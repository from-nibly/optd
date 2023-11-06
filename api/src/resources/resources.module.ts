import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/databases.module';
import { ResourceController } from './resources.controller';
import { ResourceService } from './resources.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourcesModule {}
