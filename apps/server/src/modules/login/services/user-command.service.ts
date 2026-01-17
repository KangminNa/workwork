import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../repositories/login.repository.interface';
import { User } from '../models/entities/user.entity';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';
import { BaseService } from '../../../core/base/base.service';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { Email } from '../models/values/email.vo';
import { Username } from '../models/values/username.vo';

/**
 * User Command Service
 * - 사용자 변경/검증 전담
 */
@Injectable()
export class UserCommandService extends BaseService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {
    super('UserCommandService');
  }

  // ============================================
  // 검증 (Validation)
  // ============================================

  /**
   * 이메일 중복 확인
   */
  async ensureEmailAvailable(email: string): Promise<string> {
    const normalized = Email.create(email).getValue();
    const exists = await this.userRepo.exists({ email: normalized });
    if (exists) {
      throw new ConflictException('Email already exists');
    }
    return normalized;
  }

  /**
   * 그룹 내 사용자명 중복 확인
   */
  async ensureUsernameAvailable(username: string, groupId: string): Promise<string> {
    const normalized = Username.create(username).getValue();
    const exists = await this.userRepo.exists({ username: normalized, groupId });
    if (exists) {
      throw new ConflictException('Username already exists in this group');
    }
    return normalized;
  }

  // ============================================
  // 상태 변경 (Mutation)
  // ============================================

  /**
   * 사용자명 변경
   */
  changeUsername(user: User, username: string): void {
    const normalized = Username.create(username).getValue();
    user.setUsername(normalized);
  }

  /**
   * ROOT 사용자 승인
   */
  approveRoot(user: User, groupId: string): void {
    if (user.role !== UserRole.ROOT) {
      throw new DomainException('Only ROOT users can be approved');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new DomainException('User is not pending approval');
    }

    if (user.groupId) {
      throw new DomainException('User already has a group');
    }

    user.setStatus(UserStatus.APPROVED);
    user.setGroupId(groupId);
  }

  /**
   * ROOT 사용자 거절
   */
  rejectRoot(user: User): void {
    if (user.role !== UserRole.ROOT) {
      throw new DomainException('Only ROOT users can be rejected');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new DomainException('User is not pending approval');
    }

    user.setStatus(UserStatus.REJECTED);
  }

  // ============================================
  // 저장/삭제
  // ============================================

  /**
   * 사용자 저장 (생성 또는 업데이트)
   */
  async save(user: User): Promise<User> {
    const saved = await this.userRepo.save(user);
    this.log(`User saved: ${saved.username} (${saved.id})`);
    return saved;
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string): Promise<void> {
    await this.userRepo.delete({ id });
    this.log(`User deleted: ${id}`);
  }
}
