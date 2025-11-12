import { Repository } from '../../core/server/decorators/index.js';
import { BaseRepository } from '../../core/server/BaseRepository.js';
import { User } from './entities/User.js';

/**
 * UserRepository - User 테이블 CRUD
 * 
 * Repository는 CRUD만 관심 있음
 * - 어떤 테이블(users)의
 * - 어떤 컬럼(username, email, phone 등)의
 * - 무엇을 할지(create, find, update, delete)
 * 
 * 비즈니스 로직은 Service에서 처리
 */
@Repository('userRepository')
export class UserRepository extends BaseRepository {
  /**
   * 어떤 모델(테이블)을 사용할지 - users 테이블
   */
  protected get model() {
    return this.db.user;
  }

  /**
   * username으로 사용자 찾기
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { username },
    });
  }

  /**
   * email로 사용자 찾기
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  /**
   * phone으로 사용자 찾기
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { phone },
    });
  }

  /**
   * ID로 사용자 찾기
   */
  async findById(id: number): Promise<User | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  /**
   * 모든 사용자 조회
   */
  async findAll(orderBy?: any): Promise<User[]> {
    return await this.model.findMany({
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * 사용자 생성
   */
  async create(data: {
    username: string;
    password: string;
    email: string;
    phone: string;
  }): Promise<User> {
    return await this.model.create({
      data,
    });
  }

  /**
   * 사용자 수정
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * 사용자 삭제
   */
  async delete(id: number): Promise<User> {
    return await this.model.delete({
      where: { id },
    });
  }

  /**
   * 사용자 검색 (username 또는 email)
   */
  async search(query: string): Promise<User[]> {
    return await this.model.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}

