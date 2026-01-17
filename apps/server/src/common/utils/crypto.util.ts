import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * 암호화 유틸리티
 * - 비밀번호 해싱
 * - 그룹 코드 생성
 * - 토큰 생성
 */
@Injectable()
export class CryptoUtil {
  private readonly saltRounds = 10;

  /**
   * 비밀번호 해싱 (비동기)
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * 비밀번호 해싱 (동기)
   */
  hashPasswordSync(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  /**
   * 비밀번호 검증
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 그룹 코드 생성 (기본 6자리)
   */
  generateGroupCode(length: number = 6): string {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .substring(0, length)
      .toUpperCase();
  }

  /**
   * 랜덤 토큰 생성
   */
  generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * UUID 생성
   */
  generateUUID(): string {
    return randomBytes(16).toString('hex');
  }
}

