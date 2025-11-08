import { Express, json } from 'express';
import { commonErrorMiddleware } from '@workwork/core';
import { dynamicRouter } from './dynamic_router';

export function initializeApi(app: Express) {
  app.use(json());
  app.use(dynamicRouter);
  app.use(commonErrorMiddleware);
}
