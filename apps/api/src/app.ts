import express, { Express, json } from 'express';
import { commonErrorMiddleware } from '../../../01-core/src/server';
import { dynamicRouter } from './dynamic_router';

export function initializeApi(app: Express) {
  app.use(json());
  app.use(dynamicRouter);
  app.use(commonErrorMiddleware);
}
