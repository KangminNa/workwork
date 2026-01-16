import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IResponseTransformer } from '@core/contracts/middleware';
import { ApiResponse } from '@core/contracts/base';
export declare class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>>, IResponseTransformer<T> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>>;
    transform(data: T): ApiResponse<T>;
}
