import { Injectable, ForbiddenException } from '@nestjs/common';
import { User } from '../models/entities/user.entity';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';
import { BaseService } from '../../../core/services/base.service';

/**
 * Permission Service
 * - 권한 검증만 담당
 * - 재사용 가능한 권한 체크 메서드들
 */
@Injectable()
export class PermissionService extends BaseService {
  constructor() {
    super('PermissionService');
  }

  // ============================================
  // 권한 확인 (boolean 반환)
  // ============================================

  /**
   * ADMIN 권한 확인
   */
  canApprove(actor: User): boolean {
    return actor.role === UserRole.ADMIN;
  }

  /**
   * 사용자 생성 권한 확인 (ROOT + APPROVED)
   */
  canCreateUser(actor: User): boolean {
    return actor.role === UserRole.ROOT && actor.status === UserStatus.APPROVED;
  }

  /**
   * 사용자 수정 권한 확인
   * - ROOT만 가능
   * - 같은 그룹
   * - 대상이 USER여야 함
   */
  canModifyUser(actor: User, target: User): boolean {
    if (actor.role !== UserRole.ROOT) return false;
    if (actor.status !== UserStatus.APPROVED) return false;
    if (actor.groupId !== target.groupId) return false;
    if (target.role !== UserRole.USER) return false;
    return true;
  }

  /**
   * 같은 그룹 확인
   */
  isInSameGroup(actor: User, target: User): boolean {
    return actor.groupId === target.groupId;
  }

  // ============================================
  // 권한 강제 (Exception 발생)
  // ============================================

  /**
   * ADMIN 권한 필수
   */
  ensureCanApprove(actor: User): void {
    if (!this.canApprove(actor)) {
      throw new ForbiddenException('Only ADMIN can approve ROOT users');
    }
  }

  /**
   * 사용자 생성 권한 필수
   */
  ensureCanCreateUser(actor: User): void {
    if (!this.canCreateUser(actor)) {
      throw new ForbiddenException('Only approved ROOT users can create users');
    }
  }

  /**
   * 사용자 수정 권한 필수
   */
  ensureCanModifyUser(actor: User, target: User): void {
    if (!this.canModifyUser(actor, target)) {
      throw new ForbiddenException('Cannot modify this user');
    }
  }

  /**
   * 같은 그룹 필수
   */
  ensureInSameGroup(actor: User, target: User): void {
    if (!this.isInSameGroup(actor, target)) {
      throw new ForbiddenException('User not in the same group');
    }
  }

  /**
   * 승인된 상태 필수
   */
  ensureApproved(actor: User): void {
    if (actor.status !== UserStatus.APPROVED) {
      throw new ForbiddenException('User not approved');
    }
  }

  /**
   * 특정 역할 필수
   */
  ensureRole(actor: User, ...roles: UserRole[]): void {
    if (!roles.includes(actor.role)) {
      throw new ForbiddenException(`Required roles: ${roles.join(', ')}`);
    }
  }
}

