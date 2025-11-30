import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  const port = process.env.ADMIN_PORT ? Number(process.env.ADMIN_PORT) : 3060;
  await app.listen(port);
  console.log(`Admin module is running on http://localhost:${port}`);
}

bootstrap();
