import { IRequestContext, IBaseResponse } from '../types';

/**
 * 모든 컨트롤러의 기본 클래스
 * - 공통 응답 형식 처리
 * - 에러 핸들링
 */
export abstract class BaseController<TService> {
  constructor(protected readonly service: TService) {}

  /**
   * 성공 응답 생성 (공통)
   */
  protected success<T>(data: T, context: IRequestContext): IBaseResponse<T> {
    return {
      success: true,
      data,
      meta: {
        requestId: context.requestId,
        timestamp: context.timestamp,
        duration: Date.now() - context.timestamp,
      },
    };
  }

  /**
   * 에러 응답 생성 (공통)
   */
  protected error(
    code: string,
    message: string,
    context: IRequestContext,
    details?: Record<string, any>,
  ): IBaseResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: context.requestId,
        timestamp: context.timestamp,
        duration: Date.now() - context.timestamp,
      },
    };
  }

  /**
   * 요청 컨텍스트 생성 (공통)
   */
  protected createContext(
    userId?: number,
    workspaceId?: number,
  ): IRequestContext {
    return {
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
      userId,
      workspaceId,
    };
  }

  /**
   * 요청 ID 생성
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

