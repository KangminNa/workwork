import { NestFactory } from '@nestjs/core';
import { GatewayModule } from '../interface/controllers/gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const port = process.env.GATEWAY_PORT ? Number(process.env.GATEWAY_PORT) : 4000;
  await app.listen(port);
  console.log(`Gateway listening on http://localhost:${port}`);
}

bootstrap();
