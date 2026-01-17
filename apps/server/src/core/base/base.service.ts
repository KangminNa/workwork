import { Logger } from '@nestjs/common';

/**
 * Base Service
 * - 모든 Service가 상속하는 공통 Base
 * - 로깅, 에러 처리 등 공통 기능 제공
 */
export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /**
   * 로그 헬퍼 메서드
   */
  protected log(message: string, data?: any) {
    this.logger.log(message, data);
  }
}
