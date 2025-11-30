import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const port = process.env.AUTH_PORT ? Number(process.env.AUTH_PORT) : 3010;
  await app.listen(port);
  console.log(`Auth module is running on http://localhost:${port}`);
}

bootstrap();
