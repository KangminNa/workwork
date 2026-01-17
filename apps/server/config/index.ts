/**
 * Configuration Index
 * 모든 설정 통합 export
 */

import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';

export const config = {
  app: appConfig,
  database: databaseConfig,
  jwt: jwtConfig,
};

export { appConfig, databaseConfig, jwtConfig };

