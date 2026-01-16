/**
 * Core Contracts - Middleware Interface
 * 미들웨어 계약 정의
 */

import { LogEntry, ApiResponse } from './base';

/**
 * Logger 인터페이스
 */
export interface ILogger {
  log(entry: LogEntry): void;
  error(entry: LogEntry): void;
  warn(entry: LogEntry): void;
  debug(entry: LogEntry): void;
}

/**
 * Request Interceptor 인터페이스
 */
export interface IRequestInterceptor {
  intercept(context: any, next: any): any;
}

/**
 * Response Transformer 인터페이스
 */
export interface IResponseTransformer<T = any> {
  transform(data: T): ApiResponse<T>;
}

/**
 * Error Handler 인터페이스
 */
export interface IErrorHandler {
  catch(exception: any, host: any): void;
  formatError(exception: any): ApiResponse<never>;
}

