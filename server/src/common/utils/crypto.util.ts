import * as bcrypt from 'bcrypt';

/**
 * 암호화 유틸리티 (Static Only)
 * - 인스턴스 생성 없이 사용
 */
export class CryptoUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * 비밀번호 해싱
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * 비밀번호 검증
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 랜덤 토큰 생성
   */
  static generateToken(length: number = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

