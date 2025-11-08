import { Express, json } from 'express';
import { commonErrorMiddleware } from '../../01-core/src/middlewares/common.error.middleware';
import { dynamicRouter } from './dynamic.router';

export function initializeApi(app: Express) {
  app.use(json());
  app.use(dynamicRouter);
  app.use(commonErrorMiddleware);
}
