import { IRequestContext } from '../types';

/**
 * 모든 핸들러의 기본 클래스
 * - 실제 비즈니스 로직 처리
 * - 파이프라인 패턴
 */
export abstract class BaseHandler<
  TInput,
  TOutput,
  TContext extends IRequestContext,
> {
  /**
   * 메인 실행 메서드
   */
  abstract execute(input: TInput, context: TContext): Promise<TOutput>;

  /**
   * 검증 단계 (선택적 구현)
   */
  protected async validate(input: TInput, context: TContext): Promise<void> {
    // 기본 구현 없음 (필요시 오버라이드)
  }

  /**
   * 전처리 단계 (선택적 구현)
   */
  protected async preProcess(
    input: TInput,
    context: TContext,
  ): Promise<TContext> {
    return context;
  }

  /**
   * 후처리 단계 (선택적 구현)
   */
  protected async postProcess(
    output: TOutput,
    context: TContext,
  ): Promise<TOutput> {
    return output;
  }
}

