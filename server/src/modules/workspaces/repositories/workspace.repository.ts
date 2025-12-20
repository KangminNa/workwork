import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../database/base/base.repository';
import { Workspace } from '../entities/workspace.entity';

/**
 * Workspace Repository
 * - 기본 CRUD는 BaseRepository에서 상속 (불변)
 * - 조회 메서드만 비즈니스에 맞게 추가
 */
@Injectable()
export class WorkspaceRepository extends BaseRepository<Workspace> {
  constructor(
    @InjectRepository(Workspace)
    repository: Repository<Workspace>,
  ) {
    super(repository);
  }

  // ============================================
  // 조회 전용 메서드 (비즈니스별 변경 가능)
  // ============================================

  /**
   * 초대 코드로 워크스페이스 조회
   */
  async findByInviteCode(inviteCode: string): Promise<Workspace | null> {
    return this.createQueryBuilder('workspace')
      .where('workspace.inviteCode = :inviteCode', { inviteCode })
      .getOne();
  }

  /**
   * 초대 코드 존재 여부 확인
   */
  async existsByInviteCode(inviteCode: string): Promise<boolean> {
    const count = await this.createQueryBuilder('workspace')
      .where('workspace.inviteCode = :inviteCode', { inviteCode })
      .getCount();
    return count > 0;
  }

  /**
   * 소유자 기준 워크스페이스 조회
   */
  async findByOwner(ownerId: number): Promise<Workspace[]> {
    return this.createQueryBuilder('workspace')
      .where('workspace.ownerId = :ownerId', { ownerId })
      .orderBy('workspace.createdAt', 'DESC')
      .getMany();
  }

  /**
   * 멤버와 함께 조회
   */
  async findByIdWithMembers(workspaceId: number): Promise<Workspace | null> {
    return this.createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.members', 'members')
      .where('workspace.id = :workspaceId', { workspaceId })
      .getOne();
  }
}

