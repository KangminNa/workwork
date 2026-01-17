import { Injectable } from '@nestjs/common';
import { User } from '../models/entities/user.entity';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';

/**
 * User Policy
 * - 권한/역할 규칙을 캡슐화
 */
@Injectable()
export class UserPolicy {
  ensureCanCreateUsers(actor: User): void {
    const isApprovedRoot =
      actor.role === UserRole.ROOT && actor.status === UserStatus.APPROVED;
    if (!isApprovedRoot || !actor.groupId) {
      throw new DomainException('Only approved ROOT users can create users', 403);
    }
  }

  ensureCanModifyUser(actor: User, target: User): void {
    const isApprovedRoot =
      actor.role === UserRole.ROOT && actor.status === UserStatus.APPROVED;
    const sameGroup = actor.groupId && actor.groupId === target.groupId;
    const targetIsUser = target.role === UserRole.USER;
    if (!isApprovedRoot || !sameGroup || !targetIsUser) {
      throw new DomainException('Cannot modify this user', 403);
    }
  }

  ensureCanApproveRoot(actor: User): void {
    if (actor.role !== UserRole.ADMIN) {
      throw new DomainException('Only ADMIN can approve ROOT users', 403);
    }
  }

  ensureIsRoot(user: User): void {
    if (user.role !== UserRole.ROOT) {
      throw new DomainException('Only ROOT users can be approved', 400);
    }
  }

  requireGroupId(actor: User): string {
    if (!actor.groupId) {
      throw new DomainException('User not in a group', 403);
    }
    return actor.groupId;
  }
}
