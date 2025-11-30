import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { AuthRepository } from './repositories/auth.repository';
import { AuthUser } from './entities/auth-user.entity';
import { AuthUserDto, LoginUserDto, RegisterUserDto } from '@workwork/auth/shared';
import { BaseService } from '@workwork/base/server/base.service';

@Injectable()
export class AuthService extends BaseService<AuthUser> {
  private readonly approvalToken = process.env.ADMIN_APPROVAL_TOKEN ?? 'approve-me';

  constructor(private readonly authRepository: AuthRepository) {
    super(authRepository);
  }

  register(dto: RegisterUserDto): AuthUserDto {
    const normalized = this.normalize(dto);
    this.assertUnique(normalized);

    const user: AuthUser = {
      id: randomUUID(),
      username: normalized.username,
      email: normalized.email,
      passwordHash: this.hash(normalized.password),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.stripSecret(this.save(user));
  }

  login(dto: LoginUserDto): AuthUserDto {
    const normalized = this.normalize(dto);
    const user = this.authRepository.findByUsername(normalized.username);
    if (!user || user.passwordHash !== this.hash(normalized.password)) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    if (user.status !== 'APPROVED') {
      throw new Error('관리자 승인 후 로그인할 수 있습니다.');
    }
    return this.stripSecret(user);
  }

  approve(username: string, token: string): AuthUserDto {
    this.ensureAdmin(token);
    const user = this.authRepository.findByUsername(username.trim());
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    if (user.status === 'APPROVED') {
      return this.stripSecret(user);
    }
    user.status = 'APPROVED';
    user.approvedAt = new Date();
    user.updatedAt = new Date();
    return this.stripSecret(this.save(user));
  }

  pending(token: string): AuthUserDto[] {
    this.ensureAdmin(token);
    return this.findAll()
      .filter((user) => user.status === 'PENDING')
      .map((user) => this.stripSecret(user));
  }

  private normalize<T extends Record<string, any>>(dto: T): Record<keyof T, string> {
    const normalized = {} as Record<keyof T, string>;
    Object.entries(dto).forEach(([key, value]) => {
      if (!value || typeof value !== 'string' || !value.trim()) {
        throw new Error(`${key} 필드를 입력해주세요.`);
      }
      normalized[key as keyof T] = value.trim();
    });
    return normalized;
  }

  private assertUnique(dto: RegisterUserDto) {
    if (this.authRepository.findByUsername(dto.username)) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }
    if (this.authRepository.findByEmail(dto.email)) {
      throw new Error('이미 가입된 이메일입니다.');
    }
  }

  private ensureAdmin(token?: string) {
    if (!token || token !== this.approvalToken) {
      throw new Error('유효하지 않은 관리자 토큰입니다.');
    }
  }

  private hash(value: string) {
    return createHash('sha256').update(value.trim()).digest('hex');
  }

  private stripSecret(user: AuthUser): AuthUserDto {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
