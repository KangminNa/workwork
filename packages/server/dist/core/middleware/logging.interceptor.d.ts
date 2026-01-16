import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IRequestInterceptor } from '@core/contracts/middleware';
export declare class LoggingInterceptor implements NestInterceptor, IRequestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
