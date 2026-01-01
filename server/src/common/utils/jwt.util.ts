import { JwtService } from '@nestjs/jwt';
import { IJwtPayload, IAuthToken } from '../types';

/**
 * JWT 유틸리티 (Static Only)
 */
export class JwtUtil {
  private static jwtService: JwtService;

  /**
   * JwtService 초기화 (앱 시작 시 한 번만)
   */
  static init(jwtService: JwtService): void {
    this.jwtService = jwtService;
  }

  /**
   * 토큰 생성
   */
  static generateToken(
    payload: IJwtPayload,
    expiresIn: string = '1h',
  ): IAuthToken {
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  /**
   * 토큰 검증 및 디코딩
   */
  static verifyToken(token: string): IJwtPayload {
    return this.jwtService.verify<IJwtPayload>(token);
  }

  /**
   * 토큰 디코딩 (검증 없이)
   */
  static decodeToken(token: string): IJwtPayload | null {
    return this.jwtService.decode(token) as IJwtPayload;
  }

  /**
   * expiresIn 문자열 → 초 변환
   */
  private static parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600; // 기본 1시간
    }
  }
}

