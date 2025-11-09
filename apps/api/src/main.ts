import express from 'express';
import 'reflect-metadata';
import { initializeApi } from './app';

async function bootstrap() {
  const app = express();

  initializeApi(app);

  // Load port from process.env, loaded by dotenv-cli
  const port = Number(process.env.API_PORT) || 3000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap();
