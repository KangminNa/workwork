import { Injectable } from '@nestjs/common';
import { BaseService } from '../../../../core/base/base.service';
import { UserQueryService } from '../user-query.service';
import { UserCommandService } from '../user-command.service';
import { GroupService } from '../group.service';
import { AuthService } from '../auth.service';
import { User } from '../../models/entities/user.entity';
import { ApproveRootDto } from '../../dtos/auth.dto';
import { CreateUserDto, UpdateUserRequestDto, DeleteUserRequestDto } from '../../dtos/user.dto';
import { UserPolicy } from '../../policies/user.policy';

/**
 * User Admin UseCase
 * - 사용자 생성/수정/삭제 및 승인 흐름 담당
 */
@Injectable()
export class UserAdminUseCase extends BaseService {
  constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
    private readonly userPolicy: UserPolicy,
  ) {
    super('UserAdminUseCase');
  }

  async createUser(actor: User, params: CreateUserDto) {
    this.userPolicy.ensureCanCreateUsers(actor);
    const groupId = this.userPolicy.requireGroupId(actor);

    const normalized = await this.userCommand.ensureUsernameAvailable(params.username, groupId);

    const user = this.authService.createGroupMember(normalized, params.password, groupId);
    const saved = await this.userCommand.save(user);

    return {
      message: 'User created successfully',
      user: saved.toResponse(),
    };
  }

  async updateUser(actor: User, params: UpdateUserRequestDto) {
    const target = await this.userQuery.findById(params.userId);
    this.userPolicy.ensureCanModifyUser(actor, target);

    if (params.username && params.username !== target.username) {
      const normalized = await this.userCommand.ensureUsernameAvailable(
        params.username,
        this.userPolicy.requireGroupId(actor),
      );
      this.userCommand.changeUsername(target, normalized);
    }

    if (params.password) {
      this.authService.changeUserPassword(target, params.password);
    }

    const saved = await this.userCommand.save(target);

    return {
      message: 'User updated successfully',
      user: saved.toResponse(),
    };
  }

  async deleteUser(actor: User, params: DeleteUserRequestDto) {
    const target = await this.userQuery.findById(params.userId);
    this.userPolicy.ensureCanModifyUser(actor, target);

    await this.userCommand.delete(params.userId);

    return {
      message: 'User deleted successfully',
    };
  }

  async approveRoot(actor: User, params: ApproveRootDto) {
    this.userPolicy.ensureCanApproveRoot(actor);

    const user = await this.userQuery.findById(params.userId);
    this.userPolicy.ensureIsRoot(user);

    if (params.approved) {
      const group = await this.groupService.createForRoot(user);
      this.userCommand.approveRoot(user, group.id);

      const saved = await this.userCommand.save(user);

      return {
        message: 'Root approved',
        user: saved.toResponse(),
        groupCode: group.code.getValue(),
        groupName: group.name,
      };
    }

    this.userCommand.rejectRoot(user);
    const saved = await this.userCommand.save(user);

    return {
      message: 'Root rejected',
      user: saved.toResponse(),
    };
  }

  async pendingRoots(actor: User) {
    this.userPolicy.ensureCanApproveRoot(actor);

    const roots = await this.userQuery.findPending();
    return {
      roots: roots.map((root) => root.toResponse()),
    };
  }
}
