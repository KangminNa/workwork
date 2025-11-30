import { NestFactory } from '@nestjs/core';
import { LabelModule } from './label.module';

async function bootstrap() {
  const app = await NestFactory.create(LabelModule);
  const port = process.env.LABEL_PORT ? Number(process.env.LABEL_PORT) : 3050;
  await app.listen(port);
  console.log(`Label module is running on http://localhost:${port}`);
}

bootstrap();
