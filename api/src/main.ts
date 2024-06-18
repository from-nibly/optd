import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readdir, writeFile } from 'fs/promises';
import { NextFunction } from 'express';
import cookieParser from 'cookie-parser';

async function importHandler() {
  return new Function(`return import('../../build/handler.js')`)();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await writeFile('./build/package.json', JSON.stringify({ type: 'module' }));

  const handler = (await importHandler()).handler;
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://optd.localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    return handler(req, res, next);
  });

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
