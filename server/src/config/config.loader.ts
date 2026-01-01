import { readFileSync } from 'fs';
import { join } from 'path';

export interface AppConfig {
  server: {
    host: string;
    port: number;
    apiPrefix: string;
    cors: {
      origin: string;
      credentials: boolean;
    };
  };
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
  redis: {
    host: string;
    port: number;
  };
  jwt: {
    secret: string;
    expirationTime: string;
  };
  invite: {
    codePrefix: string;
    codeLength: number;
  };
}

export class ConfigLoader {
  private static config: AppConfig;

  static load(): AppConfig {
    if (this.config) {
      return this.config;
    }

    const env = process.env.NODE_ENV || 'development';
    const configDir = join(__dirname, '../../../config');

    // 기본 설정 로드
    const defaultConfig = JSON.parse(
      readFileSync(join(configDir, 'default.json'), 'utf-8'),
    );

    // 환경별 설정 로드
    let envConfig = {};
    try {
      envConfig = JSON.parse(
        readFileSync(join(configDir, `${env}.json`), 'utf-8'),
      );
    } catch (error) {
      console.warn(`No ${env}.json config file found, using defaults`);
    }

    // 로컬 오버라이드 로드 (선택적)
    let localConfig = {};
    try {
      localConfig = JSON.parse(
        readFileSync(join(configDir, 'local.json'), 'utf-8'),
      );
    } catch (error) {
      // local.json은 선택사항
    }

    // 설정 병합 (우선순위: local > env > default)
    this.config = this.deepMerge(
      defaultConfig,
      envConfig,
      localConfig,
    ) as AppConfig;

    // 환경 변수로 오버라이드
    this.applyEnvOverrides();

    return this.config;
  }

  private static deepMerge(...objects: any[]): any {
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = oVal;
        } else if (
          pVal &&
          oVal &&
          typeof pVal === 'object' &&
          typeof oVal === 'object'
        ) {
          prev[key] = this.deepMerge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    }, {});
  }

  private static applyEnvOverrides(): void {
    // 환경 변수가 있으면 설정 오버라이드
    if (process.env.SERVER_HOST) {
      this.config.server.host = process.env.SERVER_HOST;
    }
    if (process.env.PORT) {
      this.config.server.port = parseInt(process.env.PORT, 10);
    }
    if (process.env.DB_HOST) {
      this.config.database.host = process.env.DB_HOST;
    }
    if (process.env.DB_PORT) {
      this.config.database.port = parseInt(process.env.DB_PORT, 10);
    }
    if (process.env.DB_DATABASE) {
      this.config.database.database = process.env.DB_DATABASE;
    }
    if (process.env.DB_USERNAME) {
      this.config.database.username = process.env.DB_USERNAME;
    }
    if (process.env.DB_PASSWORD) {
      this.config.database.password = process.env.DB_PASSWORD;
    }
    if (process.env.JWT_SECRET) {
      this.config.jwt.secret = process.env.JWT_SECRET;
    }
    if (process.env.REDIS_HOST) {
      this.config.redis.host = process.env.REDIS_HOST;
    }
    if (process.env.REDIS_PORT) {
      this.config.redis.port = parseInt(process.env.REDIS_PORT, 10);
    }
  }

  static get(): AppConfig {
    if (!this.config) {
      return this.load();
    }
    return this.config;
  }
}

