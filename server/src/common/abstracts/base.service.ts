import { IRequestContext } from '../types';

/**
 * 모든 서비스의 기본 클래스
 * - Handler 실행 관리
 * - 에러 처리
 */
export abstract class BaseService<THandler> {
  constructor(protected readonly handler: THandler) {}

  /**
   * 핸들러 실행 래퍼
   * - 에러 처리
   * - 로깅 (필요시)
   */
  protected async execute<TInput, TOutput>(
    handlerMethod: (input: TInput, context: IRequestContext) => Promise<TOutput>,
    input: TInput,
    context: IRequestContext,
  ): Promise<TOutput> {
    try {
      // 핸들러 실행
      return await handlerMethod.call(this.handler, input, context);
    } catch (error) {
      // 에러 처리
      this.handleError(error, context);
      throw error;
    }
  }

  /**
   * 에러 처리 (오버라이드 가능)
   */
  protected handleError(error: any, context: IRequestContext): void {
    // 기본 에러 로깅
    console.error(`[${context.requestId}] Error:`, error.message);
  }
}

