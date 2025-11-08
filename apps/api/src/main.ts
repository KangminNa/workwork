import express from 'express';
import 'reflect-metadata';
import { initializeApi } from './app';

async function bootstrap() {
  const app = express();

  initializeApi(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap();
