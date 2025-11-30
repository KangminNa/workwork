import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const port = process.env.USER_PORT ? Number(process.env.USER_PORT) : 3020;
  await app.listen(port);
  console.log(`User module is running on http://localhost:${port}`);
}

bootstrap();
