import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { MetaResourceService } from './meta.service';
import { DatabaseModule } from 'src/database/databases.module';
import { HooksModule } from 'src/hooks/hooks.module';

@Module({
  imports: [DatabaseModule, HooksModule],
  controllers: [MetaController],
  providers: [MetaResourceService],
})
export class MetaModule {}
