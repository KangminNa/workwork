/**
 * NestJS Application Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from '@core/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Get Config Service
  const configService = app.get(AppConfigService);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  const port = configService.app.port;
  await app.listen(port);

  console.log(`
🚀 Server is running on: http://localhost:${port}
📚 API Prefix: /api
🌍 Environment: ${configService.app.nodeEnv}
  `);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

