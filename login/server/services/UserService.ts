/**
 * User Service
 * 비즈니스 로직 처리
 */

import { BaseService } from '../../../core/server/services/BaseService';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../../shared/types';

export class UserService extends BaseService<User, UserRepository> {
  constructor() {
    super(new UserRepository());
  }

  /**
   * 로그인
   */
  async login(email: string, password: string): Promise<User | null> {
    // 이메일로 사용자 조회
    const user = await this.repository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    // 비밀번호 검증 (실제로는 bcrypt 사용)
    // TODO: bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  /**
   * 이메일 중복 체크
   */
  async checkEmailExists(email: string): Promise<boolean> {
    return await this.repository.existsByEmail(email);
  }

  /**
   * 사용자 생성 (회원가입)
   */
  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    // TODO: 비밀번호 해싱
    // const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return await this.create({
      email: data.email,
      password: data.password, // 실제로는 hashedPassword
      name: data.name,
    });
  }

  /**
   * 생성 전 검증
   */
  protected async validateCreate(data: any): Promise<void> {
    // 이메일 중복 체크
    const exists = await this.checkEmailExists(data.email);
    if (exists) {
      throw new Error('Email already exists');
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // 비밀번호 길이 검증
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }
}

