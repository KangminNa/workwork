/**
 * 초대 코드 생성 유틸리티
 */
export class InviteCodeUtil {
  /**
   * 고유한 초대 코드 생성
   * 형식: WORK-XXXXXX (대문자 + 숫자 6자리)
   */
  static generate(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    
    return `WORK-${code}`;
  }

  /**
   * 초대 코드 유효성 검증
   */
  static isValid(code: string): boolean {
    const pattern = /^WORK-[A-Z0-9]{6}$/;
    return pattern.test(code);
  }
}

