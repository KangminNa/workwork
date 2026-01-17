import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGroupRepository } from '../repos/login.repository.interface';
import { Group } from '../models/entities/group.entity';
import { User } from '../models/entities/user.entity';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { BaseService } from '../../../core/services/base.service';

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
   * 소유자 ID로 조회
   */
  async findByOwner(ownerId: string): Promise<Group | null> {
    return this.groupRepo.findOne({ ownerId });
  }

  // ============================================
  // 검증 (Validation)
  // ============================================

  /**
   * 그룹 존재 여부 확인
   */
  async exists(where: any): Promise<boolean> {
    return this.groupRepo.exists(where);
  }

  // ============================================
  // 생성 (Create)
  // ============================================

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

  /**
   * 그룹 생성 (일반)
   */
  async create(name: string, ownerId: string, description?: string): Promise<Group> {
    const group = Group.create(name, ownerId, this.crypto, description);
    const saved = await this.groupRepo.save(group);
    this.log(`Group created: ${saved.name} (${saved.code.getValue()})`);
    return saved;
  }

  // ============================================
  // 저장 (Update)
  // ============================================

  /**
   * 그룹 저장
   */
  async save(group: Group): Promise<Group> {
    const saved = await this.groupRepo.save(group);
    this.log(`Group saved: ${saved.name} (${saved.id})`);
    return saved;
  }

  // ============================================
  // 삭제 (Delete)
  // ============================================

  /**
   * 그룹 삭제
   */
  async delete(id: string): Promise<void> {
    await this.groupRepo.delete({ id });
    this.log(`Group deleted: ${id}`);
  }
}

