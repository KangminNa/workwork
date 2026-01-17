import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGroupRepository } from '../repositories/login.repository.interface';
import { Group } from '../models/entities/group.entity';
import { User } from '../models/entities/user.entity';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { BaseService } from '../../../core/base/base.service';

/**
 * Group Service
 * - 그룹 CRUD만 담당
 * - 재사용 가능한 작은 단위 메서드들
 */
@Injectable()
export class GroupService extends BaseService {
  constructor(
    @Inject('IGroupRepository')
    private readonly groupRepo: IGroupRepository,
    private readonly crypto: CryptoUtil,
  ) {
    super('GroupService');
  }

  // ============================================
  // 조회 (Read)
  // ============================================

  /**
   * ID로 그룹 조회
   */
  async findById(id: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ id });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  /**
   * 그룹 코드로 조회
   */
  async findByCode(code: string): Promise<Group | null> {
    return this.groupRepo.findOne({ code });
  }

  /**
   * ROOT 사용자를 위한 그룹 생성
   */
  async createForRoot(root: User): Promise<Group> {
    const group = Group.create(
      `${root.username}'s Workspace`,
      root.id,
      this.crypto,
      'Root user workspace',
    );

    const saved = await this.groupRepo.save(group);
    this.log(`Group created for ROOT: ${saved.name} (${saved.code.getValue()})`);
    return saved;
  }
}
