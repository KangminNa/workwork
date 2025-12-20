import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../database/base/base.repository';
import { User } from '../entities/user.entity';

/**
 * User Repository
 * - 기본 CRUD는 BaseRepository에서 상속 (불변)
 * - 조회 메서드만 비즈니스에 맞게 추가
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  // ============================================
  // 조회 전용 메서드 (비즈니스별 변경 가능)
  // ============================================

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * 이메일 중복 확인
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getCount();
    return count > 0;
  }

  /**
   * 워크스페이스 멤버 조회
   */
  async findByWorkspace(workspaceId: number): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('user.workspaceId = :workspaceId', { workspaceId })
      .orderBy('user.createdAt', 'ASC')
      .getMany();
  }

  /**
   * 워크스페이스와 함께 조회
   */
  async findByIdWithWorkspace(userId: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.workspace', 'workspace')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}

