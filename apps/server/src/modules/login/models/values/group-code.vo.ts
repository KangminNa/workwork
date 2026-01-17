import { DomainException } from '../../../../common/exceptions/domain.exception';
import { CryptoUtil } from '../../../../common/utils/crypto.util';
import { StringValueObject } from '../../../../core/base/value-object.base';

/**
 * GroupCode Value Object
 * - 그룹 코드 생성 및 검증
 * - 불변성 보장
 * - StringValueObject 상속으로 공통 기능 재사용
 */
export class GroupCode extends StringValueObject {
  private static readonly LENGTH = 6;

  private constructor(value: string) {
    super(value);
  }

  /**
   * 새로운 그룹 코드 생성
   */
  static generate(cryptoUtil: CryptoUtil): GroupCode {
    const code = cryptoUtil.generateGroupCode(this.LENGTH);
    return new GroupCode(code);
  }

  /**
   * 기존 그룹 코드로 생성 (DB에서 로드 시)
   */
  static create(code: string): GroupCode {
    if (!code) {
      throw new DomainException('Group code is required');
    }

    if (!this.isValid(code)) {
      throw new DomainException('Invalid group code format');
    }

    return new GroupCode(code.toUpperCase());
  }

  /**
   * 그룹 코드 형식 검증
   */
  private static isValid(code: string): boolean {
    // 6자리 영문 대문자 + 숫자
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(code);
  }
}

