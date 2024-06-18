import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readdir, writeFile } from 'fs/promises';
import { NextFunction } from 'express';

async function importHandler() {
  return new Function(`return import('../../build/handler.js')`)();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await writeFile('./build/package.json', JSON.stringify({ type: 'module' }));

  const handler = (await importHandler()).handler;

  app.setGlobalPrefix('api');

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/auth')) {
      return next();
    }
    return handler(req, res, next);
  });
  await app.listen(3000);
}
bootstrap();
