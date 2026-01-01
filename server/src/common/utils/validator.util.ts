/**
 * 검증 유틸리티 (Static Only)
 */
export class ValidatorUtil {
  /**
   * 이메일 검증
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 비밀번호 강도 검증
   */
  static isStrongPassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * 초대 코드 형식 검증
   */
  static isValidInviteCode(
    code: string,
    prefix: string,
    length: number,
  ): boolean {
    const pattern = new RegExp(`^${prefix}-[A-Z0-9]{${length}}$`);
    return pattern.test(code);
  }

  /**
   * 객체 필수 필드 검증
   */
  static hasRequiredFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
  ): boolean {
    return fields.every(
      (field) => obj[field] !== undefined && obj[field] !== null,
    );
  }

  /**
   * 이름 검증
   */
  static isValidName(name: string, minLength: number = 2): boolean {
    return name && name.length >= minLength;
  }
}

