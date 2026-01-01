import { ConfigLoader } from '../../config/config.loader';

/**
 * 초대 코드 생성 유틸리티
 * Config에서 prefix와 length를 가져옴
 */
export class InviteCodeUtil {
  /**
   * 고유한 초대 코드 생성
   * 형식: {PREFIX}-{XXXXXX} (대문자 + 숫자)
   */
  static generate(): string {
    const config = ConfigLoader.get();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < config.invite.codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }

    return `${config.invite.codePrefix}-${code}`;
  }

  /**
   * 초대 코드 유효성 검증
   */
  static isValid(code: string): boolean {
    const config = ConfigLoader.get();
    const pattern = new RegExp(
      `^${config.invite.codePrefix}-[A-Z0-9]{${config.invite.codeLength}}$`,
    );
    return pattern.test(code);
  }
}

