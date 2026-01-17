import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repos/login.repository.interface';
import { User } from '../models/entities/user.entity';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';
import { BaseService } from '../../../core/services/base.service';

/**
 * User Service
 * - 사용자 CRUD만 담당
 * - 재사용 가능한 작은 단위 메서드들
 * - 권한 검증은 PermissionService에 위임
 */
@Injectable()
export class UserService extends BaseService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {
    super('UserService');
  }

  // ============================================
  // 조회 (Read)
  // ============================================

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * 단일 조건으로 사용자 조회
   */
  async findOne(where: any): Promise<User | null> {
    return this.userRepo.findOne(where);
  }

  /**
   * 여러 조건으로 사용자 목록 조회
   */
  async findMany(where?: any): Promise<User[]> {
    return this.userRepo.findMany(where);
  }

  /**
   * 그룹별 사용자 조회
   */
  async findByGroup(groupId: string, role?: UserRole): Promise<User[]> {
    const where: any = { groupId };
    if (role) where.role = role;
    return this.userRepo.findMany(where);
  }

  /**
   * 승인 대기 중인 ROOT 사용자 조회
   */
  async findPending(): Promise<User[]> {
    return this.userRepo.findMany({
      role: UserRole.ROOT,
      status: UserStatus.PENDING,
    });
  }

  // ============================================
  // 검증 (Validation)
  // ============================================

  /**
   * 사용자 존재 여부 확인
   */
  async exists(where: any): Promise<boolean> {
    return this.userRepo.exists(where);
  }

  /**
   * 중복 확인 (ConflictException 발생)
   */
  async ensureNotExists(where: any, message: string): Promise<void> {
    const exists = await this.exists(where);
    if (exists) {
      throw new NotFoundException(message);
    }
  }

  // ============================================
  // 저장 (Create/Update)
  // ============================================

  /**
   * 사용자 저장 (생성 또는 업데이트)
   */
  async save(user: User): Promise<User> {
    const saved = await this.userRepo.save(user);
    this.log(`User saved: ${saved.username} (${saved.id})`);
    return saved;
  }

  // ============================================
  // 삭제 (Delete)
  // ============================================

  /**
   * 사용자 삭제
   */
  async delete(id: string): Promise<void> {
    await this.userRepo.delete({ id });
    this.log(`User deleted: ${id}`);
  }
}

