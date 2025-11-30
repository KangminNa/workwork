import { NestFactory } from '@nestjs/core';
import { ScheduleModule } from './schedule.module';

async function bootstrap() {
  const app = await NestFactory.create(ScheduleModule);
  const port = process.env.SCHEDULE_PORT ? Number(process.env.SCHEDULE_PORT) : 3030;
  await app.listen(port);
  console.log(`Schedule module is running on http://localhost:${port}`);
}

bootstrap();
