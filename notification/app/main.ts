import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  const port = process.env.NOTIFICATION_PORT ? Number(process.env.NOTIFICATION_PORT) : 3040;
  await app.listen(port);
  console.log(`Notification module is running on http://localhost:${port}`);
}

bootstrap();
