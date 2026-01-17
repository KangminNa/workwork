import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/entities/user.entity';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { BaseService } from '../../../core/services/base.service';

/**
 * Auth Service
 * - 인증/토큰 생성만 담당
 * - 재사용 가능한 작은 단위 메서드들
 */
@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly jwt: JwtService,
    private readonly crypto: CryptoUtil,
  ) {
    super('AuthService');
  }

  // ============================================
  // JWT 토큰
  // ============================================

  /**
   * JWT Access Token 생성
   */
  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email?.getValue(),
      username: user.username,
      role: user.role,
      status: user.status,
      groupId: user.groupId,
    };
    return this.jwt.sign(payload);
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token: string): any {
    return this.jwt.verify(token);
  }

  // ============================================
  // 비밀번호 검증
  // ============================================

  /**
   * 비밀번호 검증
   */
  async verifyPassword(user: User, plainPassword: string): Promise<boolean> {
    return user.password.compare(plainPassword, this.crypto);
  }

  /**
   * 비밀번호 해싱
   */
  hashPassword(plainPassword: string): string {
    return this.crypto.hashPasswordSync(plainPassword);
  }

  // ============================================
  // Entity 생성 헬퍼
  // ============================================

  /**
   * ROOT 사용자 생성
   */
  createRootUser(email: string, username: string, password: string): User {
    return User.createRoot(email, username, password, this.crypto);
  }

  /**
   * 그룹 멤버 생성
   */
  createGroupMember(username: string, password: string, groupId: string): User {
    return User.createGroupMember(username, password, groupId, this.crypto);
  }
}

