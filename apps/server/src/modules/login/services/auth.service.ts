import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/entities/user.entity';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { BaseService } from '../../../core/services/base.service';
import { Email } from '../models/values/email.vo';
import { Password } from '../models/values/password.vo';
import { Username } from '../models/values/username.vo';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';

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
  async verifyPassword(user: User, plainPassword: string): Promise<boolean> {
    return user.password.compare(plainPassword, this.crypto);
  }

  // ============================================
  // Entity 생성 헬퍼
  // ============================================

  /**
   * ROOT 사용자 생성
   */
  createRootUser(email: string, username: string, password: string): User {
    return User.create({
      email: Email.create(email),
      username: Username.create(username).getValue(),
      password: Password.create(password, this.crypto),
      role: UserRole.ROOT,
      status: UserStatus.PENDING,
    });
  }

  /**
   * 그룹 멤버 생성
   */
  createGroupMember(username: string, password: string, groupId: string): User {
    return User.create({
      username: Username.create(username).getValue(),
      password: Password.create(password, this.crypto),
      role: UserRole.USER,
      status: UserStatus.APPROVED,
      groupId,
    });
  }

  /**
   * 사용자 비밀번호 변경
   */
  changeUserPassword(user: User, newPassword: string): void {
    user.setPassword(Password.create(newPassword, this.crypto));
  }
}
