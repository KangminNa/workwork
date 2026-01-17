import { Injectable } from '@nestjs/common';
import { BaseService } from '../../../../core/base/base.service';
import { UserQueryService } from '../user-query.service';
import { User } from '../../models/entities/user.entity';
import { UserPolicy } from '../../policies/user.policy';

/**
 * User Query UseCase
 * - 사용자 조회 흐름 담당
 */
@Injectable()
export class UserQueryUseCase extends BaseService {
  constructor(
    private readonly userQuery: UserQueryService,
    private readonly userPolicy: UserPolicy,
  ) {
    super('UserQueryUseCase');
  }

  async listUsers(actor: User) {
    const groupId = this.userPolicy.requireGroupId(actor);
    const users = await this.userQuery.findByGroup(groupId);

    return {
      users: users.map((user) => user.toResponse()),
    };
  }
}
