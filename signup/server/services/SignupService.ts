import crypto from 'crypto';
import { User } from '@prisma/client';
import { BaseService } from '../../../core/server/services';
import { SignupRequest } from '../../shared/types';
import { SignupRepository } from '../repositories/SignupRepository';

export class SignupService extends BaseService<User, SignupRepository> {
  constructor(repository: SignupRepository) {
    super(repository);
  }

  async register(payload: SignupRequest): Promise<User> {
    await this.validateCreate(payload);

    const hashedPassword = this.hashPassword(payload.password);

    const user = await this.repository.createUser({
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
      name: payload.name,
    });

    await this.repository.createSignupNotification(user);

    return user;
  }

  protected async validateCreate(data: SignupRequest): Promise<void> {
    if (!data.email || !data.username || !data.password) {
      throw {
        statusCode: 400,
        message: '이메일, 아이디, 비밀번호는 필수입니다.',
      };
    }

    if (!this.isValidEmail(data.email)) {
      throw {
        statusCode: 400,
        message: '올바른 이메일 형식이 아닙니다.',
      };
    }

    if (data.username.length < 4) {
      throw {
        statusCode: 400,
        message: '아이디는 최소 4자 이상이어야 합니다.',
      };
    }

    if (data.password.length < 6) {
      throw {
        statusCode: 400,
        message: '비밀번호는 최소 6자 이상이어야 합니다.',
      };
    }

    const existingUser = await this.repository.findByEmailOrUsername(data.email, data.username);

    if (existingUser) {
      const duplicatedField = existingUser.email === data.email ? '이메일' : '아이디';
      throw {
        statusCode: 400,
        message: `${duplicatedField}이 이미 사용 중입니다.`,
      };
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}
