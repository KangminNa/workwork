/**
 * Core Middleware - Logging Interceptor
 * 모든 HTTP 요청/응답 로깅
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IRequestInterceptor, ILogger } from '@core/contracts/middleware';
import { LogEntry, HttpMethod } from '@core/contracts/base';

@Injectable()
export class LoggingInterceptor implements NestInterceptor, IRequestInterceptor {
  private readonly logger: Logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const now = Date.now();

    // 요청 로깅
    const requestLog: LogEntry = {
      type: 'REQUEST',
      method: method as HttpMethod,
      url,
      params,
      query,
      body,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(JSON.stringify(requestLog));

    return next.handle().pipe(
      tap({
        next: (data) => {
          // 성공 응답 로깅
          const response = context.switchToHttp().getResponse();
          const responseLog: LogEntry = {
            type: 'RESPONSE',
            method: method as HttpMethod,
            url,
            statusCode: response.statusCode,
            duration: `${Date.now() - now}ms`,
            timestamp: new Date().toISOString(),
          };
          this.logger.log(JSON.stringify(responseLog));
        },
      }),
    );
  }
}

