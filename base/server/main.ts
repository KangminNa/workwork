import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BaseModule } from './base.module';

@Module({})
class BaseRootModule extends BaseModule {
  protected moduleName = 'BaseRootModule';
}

async function bootstrap() {
  const app = await NestFactory.create(BaseRootModule);
  const port = process.env.BASE_PORT ? Number(process.env.BASE_PORT) : 3001;
  await app.listen(port);
  console.log(`Base module is running on http://localhost:${port}`);
}

bootstrap();
