import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { IErrorHandler } from '@core/contracts/middleware';
import { ApiResponse } from '@core/contracts/base';
export declare class GlobalExceptionFilter implements ExceptionFilter, IErrorHandler {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    formatError(exception: any): ApiResponse<never>;
}
