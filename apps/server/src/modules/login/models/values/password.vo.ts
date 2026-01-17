import { DomainException } from '../../../../common/exceptions/domain.exception';
import { CryptoUtil } from '../../../../common/utils/crypto.util';
import { ValueObject } from '../../../../core/types/value-object.base';

/**
 * Password Value Object
 * - 비밀번호 정책 적용
 * - 자동 해싱
 * - 불변성 보장
 * - ValueObject 상속으로 공통 기능 재사용
 */
export class Password extends ValueObject<string> {
  private constructor(hashedValue: string) {
    super(hashedValue);
  }

  /**
   * 평문 비밀번호로 생성 (자동 해싱)
   */
  static create(plainPassword: string, cryptoUtil: CryptoUtil): Password {
    if (!plainPassword) {
      throw new DomainException('Password is required');
    }

    if (plainPassword.length < 6) {
      throw new DomainException('Password must be at least 6 characters');
    }

    if (plainPassword.length > 100) {
      throw new DomainException('Password is too long');
    }

    // 해싱
    const hashedValue = cryptoUtil.hashPasswordSync(plainPassword);
    return new Password(hashedValue);
  }

  /**
   * 이미 해싱된 비밀번호로 생성 (DB에서 로드 시 사용)
   */
  static fromHashed(hashedValue: string): Password {
    if (!hashedValue) {
      throw new DomainException('Hashed password is required');
    }
    return new Password(hashedValue);
  }

  /**
   * 비밀번호 검증
   */
  async compare(plainPassword: string, cryptoUtil: CryptoUtil): Promise<boolean> {
    return cryptoUtil.comparePassword(plainPassword, this._value);
  }

  /**
   * 해싱된 값 반환 (DB 저장 시 사용)
   */
  getHashedValue(): string {
    return this._value;
  }
}

