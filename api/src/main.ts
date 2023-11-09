import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './database/databases.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const service = app.get(DatabaseService);

  const dbApp = require('express-pouchdb')(service.default, {
    mode: 'minimumForPouchDB',
    overrideMode: {
      include: ['routes/fauxton'],
    },
  });
  dbApp.listen(3001);

  await app.listen(3000);
}
bootstrap();
