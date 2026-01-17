import { DomainException } from '../../../../common/exceptions/domain.exception';
import { StringValueObject } from '../../../../core/types/value-object.base';

/**
 * Email Value Object
 * - 이메일 형식 검증
 * - 불변성 보장
 * - StringValueObject 상속으로 공통 기능 재사용
 */
export class Email extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  /**
   * Email 생성 (Factory Method)
   */
  static create(email: string): Email {
    if (!email) {
      throw new DomainException('Email is required');
    }

    if (!this.isValid(email)) {
      throw new DomainException('Invalid email format');
    }

    return new Email(email.toLowerCase().trim());
  }

  /**
   * 이메일 형식 검증
   */
  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 도메인 추출 (예: @workwork.com)
   */
  getDomain(): string {
    return this._value.split('@')[1];
  }
}

