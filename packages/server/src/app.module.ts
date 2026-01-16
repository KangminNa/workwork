/**
 * Root Application Module
 */

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppConfigModule } from '@core/config';
import { LoggingInterceptor, GlobalExceptionFilter, TransformInterceptor } from '@core/middleware';
import { GroupModule } from './modules/group/group.module';

@Module({
  imports: [
    // Global Config
    AppConfigModule,

    // Domain Modules
    GroupModule,
  ],
  providers: [
    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global Transform Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}

