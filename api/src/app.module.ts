import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KindModule } from './kinds/kind.module';

@Module({
  imports: [KindModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
