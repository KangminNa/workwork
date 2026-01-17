import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from '../config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // CORS 활성화
  app.enableCors({
    origin: config.app.corsOrigin,
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix(config.app.apiPrefix);

  await app.listen(config.app.port);

  console.log(`
🚀 Server is running on: http://localhost:${config.app.port}
📚 API: http://localhost:${config.app.port}/${config.app.apiPrefix}
🌍 Environment: ${config.app.nodeEnv}
🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}
  `);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

