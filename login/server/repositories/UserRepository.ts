/**
 * User Repository
 * Prisma를 신경쓰지 않고 BaseRepository만 상속
 */

import { BaseRepository } from '../../../core/server/repositories/BaseRepository';
import { User } from '../../shared/types';

export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user'; // Prisma 모델명 (소문자)

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  }

  /**
   * 이메일 존재 여부 확인
   */
  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email });
  }
}

