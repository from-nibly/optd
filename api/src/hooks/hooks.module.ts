import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';

@Module({
  imports: [],
  controllers: [],
  providers: [HooksService],
  exports: [HooksService],
})
export class HooksModule {}
