/**
 * Core Config - Config Service
 * 타입 안전한 환경변수 접근
 */

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import {
  IAppConfig,
  IDatabaseConfig,
  IJwtConfig,
  IRedisConfig,
  IConfig,
} from '@core/contracts/config';

@Injectable()
export class AppConfigService implements IConfig {
  constructor(private readonly configService: NestConfigService) {}

  get app(): IAppConfig {
    return {
      port: this.configService.get<number>('PORT', 3000),
      nodeEnv: this.configService.get<string>('NODE_ENV', 'development'),
      isProduction: this.configService.get('NODE_ENV') === 'production',
      isDevelopment: this.configService.get('NODE_ENV') === 'development',
    };
  }

  get database(): IDatabaseConfig {
    return {
      url: this.configService.get<string>('DATABASE_URL', ''),
    };
  }

  get jwt(): IJwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET', ''),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    };
  }

  get redis(): IRedisConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    };
  }
}

