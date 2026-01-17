import { DomainException } from '../../../../common/exceptions/domain.exception';
import { StringValueObject } from '../../../../core/types/value-object.base';

/**
 * Username Value Object
 * - 사용자명 규칙을 캡슐화
 */
export class Username extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Username 생성
   */
  static create(username: string): Username {
    if (!username) {
      throw new DomainException('Username is required');
    }

    const normalized = username.trim();
    if (!normalized) {
      throw new DomainException('Username cannot be empty');
    }

    return new Username(normalized);
  }
}
