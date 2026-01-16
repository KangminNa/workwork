/**
 * Core Middleware - Global Exception Filter
 * 모든 에러 통합 처리 및 로깅
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { IErrorHandler } from '@core/contracts/middleware';
import { ApiResponse, LogEntry, HttpMethod } from '@core/contracts/base';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter, IErrorHandler {
  private readonly logger = new Logger('ERROR');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // 에러 로깅
    const errorLog: LogEntry = {
      type: 'ERROR',
      method: request.method as HttpMethod,
      url: request.url,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      params: request.params,
      query: request.query,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(JSON.stringify(errorLog));

    // 통일된 에러 응답
    const errorResponse = this.formatError(exception);
    errorResponse.error!.path = request.url;

    response.status(status).json(errorResponse);
  }

  formatError(exception: any): ApiResponse<never> {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    return {
      success: false,
      error: {
        code: status,
        message,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

