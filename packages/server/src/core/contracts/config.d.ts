/**
 * Core Contracts - Config Interface
 * 환경변수 설정 계약
 */

/**
 * App Config 인터페이스
 */
export interface IAppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Database Config 인터페이스
 */
export interface IDatabaseConfig {
  url: string;
}

/**
 * JWT Config 인터페이스
 */
export interface IJwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Redis Config 인터페이스 (선택적)
 */
export interface IRedisConfig {
  host: string;
  port: number;
}

/**
 * 통합 Config 인터페이스
 */
export interface IConfig {
  app: IAppConfig;
  database: IDatabaseConfig;
  jwt: IJwtConfig;
  redis?: IRedisConfig;
}

