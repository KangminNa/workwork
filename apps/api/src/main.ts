import express from 'express';
import 'reflect-metadata';
import { initializeApi } from './app';
import config from '@workwork/config';

async function bootstrap() {
  const app = express();

  initializeApi(app);

  app.listen(config.api.port, () => {
    console.log(`Server listening on port ${config.api.port}`);
  });
}

bootstrap();
