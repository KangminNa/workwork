import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigLoader } from './config/config.loader';

async function bootstrap() {
  const config = ConfigLoader.get();
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: config.server.cors.origin,
    credentials: config.server.cors.credentials,
  });

  // Global prefix
  app.setGlobalPrefix(config.server.apiPrefix);

  // Validation Pipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 에러
      transform: true, // 자동 타입 변환
    }),
  );

  await app.listen(config.server.port);

  console.log(
    `🚀 Server is running on: http://${config.server.host}:${config.server.port}/${config.server.apiPrefix}`,
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `📊 Database: ${config.database.database}@${config.database.host}:${config.database.port}`,
  );
}

bootstrap();

