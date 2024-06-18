import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readdir, writeFile } from 'fs/promises';

async function importHandler() {
  return new Function(`return import('../../build/handler.js')`)();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await writeFile('./build/package.json', JSON.stringify({ type: 'module' }));

  const handler = (await importHandler()).handler;

  app.use(handler);
  await app.listen(3000);
}
bootstrap();
