import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseService } from '../../../../core/services/base.service';
import { UserQueryService } from '../user-query.service';
import { UserCommandService } from '../user-command.service';
import { GroupService } from '../group.service';
import { AuthService } from '../auth.service';
import { SignupDto, LoginDto } from '../../dtos/auth.dto';
import { User } from '../../models/entities/user.entity';
import { Email } from '../../models/values/email.vo';
import { Username } from '../../models/values/username.vo';

/**
 * Auth UseCase
 * - 회원가입/로그인 흐름 담당
 */
@Injectable()
export class AuthUseCase extends BaseService {
  constructor(
    private readonly userQuery: UserQueryService,
    private readonly userCommand: UserCommandService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
  ) {
    super('AuthUseCase');
  }

  async signup(params: SignupDto) {
    await this.userCommand.ensureEmailAvailable(params.email);

    const user = this.authService.createRootUser(params.email, params.username, params.password);
    const saved = await this.userCommand.save(user);

    return {
      message: 'Signup successful. Waiting for admin approval.',
      user: saved.toResponse(),
    };
  }

  async login(params: LoginDto) {
    let user: User | null = null;

    if (params?.groupCode && params.username) {
      const group = await this.groupService.findByCode(params.groupCode);
      if (!group) throw new UnauthorizedException('Invalid credentials');
      const normalized = Username.create(params.username).getValue();
      user = await this.userQuery.findOne({ username: normalized, groupId: group.id });
    } else if (params?.email) {
      const normalized = Email.create(params.email).getValue();
      user = await this.userQuery.findOne({ email: normalized });
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.authService.verifyPassword(user, params.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.authService.generateToken(user);

    let groupCode: string | undefined;
    if (user.groupId) {
      const group = await this.groupService.findById(user.groupId);
      groupCode = group.code.getValue();
    }

    return {
      message: 'Login successful',
      accessToken,
      user: user.toResponse(),
      groupCode,
    };
  }
}
