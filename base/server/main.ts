import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // Serve static assets for the base browser (HTML + compiled JS)
  const projectRoot = process.cwd();
  const staticHtmlPath = resolve(projectRoot, 'base/browser/static');
  const staticJsPath = resolve(projectRoot, 'dist/base/browser');
  const authStaticHtmlPath = resolve(projectRoot, 'auth/browser/static');
  const authStaticJsPath = resolve(projectRoot, 'dist/auth/browser');

  app.useStaticAssets(staticHtmlPath, {
    index: ['index.html'],
  });
  app.useStaticAssets(staticJsPath, {
    prefix: '/static',
  });
  app.useStaticAssets(authStaticHtmlPath, {
    prefix: '/auth',
    index: ['index.html'],
  });
  app.useStaticAssets(authStaticJsPath, {
    prefix: '/auth/static',
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`🚀 Base server listening on port ${port}`);
}

bootstrap();
