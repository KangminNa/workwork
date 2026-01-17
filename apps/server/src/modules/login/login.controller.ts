import { Controller, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { BaseController } from '../../core/controllers/base.controller';
import { PublicActions } from '../../core/decorators/public-actions.decorator';
import { UserService } from './services/user.service';
import { GroupService } from './services/group.service';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';
import { User } from './models/entities/user.entity';
import { SignupDto, LoginDto } from './dtos/auth.dto';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';

/**
 * Login Controller
 * - BaseController 상속으로 자동 라우팅
 * - Service 모듈들을 조합하여 비즈니스 로직 구성
 * 
 * 엔드포인트:
 * - POST /api/auth/signup      → handleSignup()
 * - POST /api/auth/login       → handleLogin()
 * - POST /api/auth/create      → handleCreate()
 * - POST /api/auth/update      → handleUpdate()
 * - POST /api/auth/delete      → handleDelete()
 * - POST /api/auth/approve     → handleApprove()
 * - POST /api/auth/pending     → handlePending()
 * - GET  /api/auth/users       → queryUsers()
 */
@Controller('auth')
@PublicActions('login', 'signup')
export class LoginController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  // ============================================
  // Public 엔드포인트 (인증 불필요)
  // ============================================

  /**
   * ROOT 회원가입
   * POST /api/signup
   */
  async handleSignup(_actor: User | null, params: SignupDto) {
    // 1. 중복 확인 (UserService)
    const exists = await this.userService.exists({ email: params.email });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    // 2. Entity 생성 (AuthService)
    const user = this.authService.createRootUser(params.email, params.username, params.password);

    // 3. 저장 (UserService)
    const saved = await this.userService.save(user);

    return {
      message: 'Signup successful. Waiting for admin approval.',
      user: saved.toResponse(),
    };
  }

  /**
   * 로그인
   * POST /api/login
   */
  async handleLogin(_actor: User | null, params: LoginDto) {
    // 1. 사용자 찾기
    let user: User | null = null;

    if (params?.groupCode && params.username) {
      // GROUP USER 로그인
      const group = await this.groupService.findByCode(params.groupCode);
      if (!group) throw new UnauthorizedException('Invalid credentials');
      user = await this.userService.findOne({ username: params.username, groupId: group.id });
    } else if (params?.email) {
      // ROOT/ADMIN 로그인
      user = await this.userService.findOne({ email: params.email });
    }

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. 비밀번호 검증 (AuthService)
    const valid = await this.authService.verifyPassword(user, params.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // 3. 토큰 생성 (AuthService)
    const accessToken = this.authService.generateToken(user);

    // 4. 그룹 코드 조회 (GroupService)
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

  // ============================================
  // 인증 필요 엔드포인트
  // ============================================

  /**
   * 사용자 생성 (ROOT가 USER 생성)
   * POST /api/create
   */
  async handleCreate(actor: User, params: CreateUserDto) {
    // 1. 권한 검증 (PermissionService)
    this.permissionService.ensureCanCreateUser(actor);

    // 2. 중복 확인 (UserService)
    const exists = await this.userService.exists({
      username: params.username,
      groupId: actor.groupId,
    });
    if (exists) {
      throw new ConflictException('Username already exists in this group');
    }

    // 3. Entity 생성 (AuthService)
    const user = this.authService.createGroupMember(params.username, params.password, actor.groupId!);

    // 4. 저장 (UserService)
    const saved = await this.userService.save(user);

    return {
      message: 'User created successfully',
      user: saved.toResponse(),
    };
  }

  /**
   * 사용자 수정
   * POST /api/update
   */
  async handleUpdate(actor: User, params: UpdateUserDto & { userId: string }) {
    // 1. 대상 사용자 로드 (UserService)
    const target = await this.userService.findById(params.userId);

    // 2. 권한 검증 (PermissionService)
    this.permissionService.ensureCanModifyUser(actor, target);

    // 3. 변경사항 적용 (Entity)
    if (params.username && params.username !== target.username) {
      // 중복 확인
      const exists = await this.userService.exists({
        username: params.username,
        groupId: actor.groupId,
      });
      if (exists) {
        throw new ConflictException('Username already exists');
      }
      target.changeUsername(params.username);
    }

    if (params.password) {
      target.changePassword(params.password, this.authService['crypto']);
    }

    // 4. 저장 (UserService)
    const saved = await this.userService.save(target);

    return {
      message: 'User updated successfully',
      user: saved.toResponse(),
    };
  }

  /**
   * 사용자 삭제
   * POST /api/delete
   */
  async handleDelete(actor: User, params: { userId: string }) {
    // 1. 대상 사용자 로드 (UserService)
    const target = await this.userService.findById(params.userId);

    // 2. 권한 검증 (PermissionService)
    this.permissionService.ensureCanModifyUser(actor, target);

    // 3. 삭제 (UserService)
    await this.userService.delete(params.userId);

    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * ROOT 승인/거절 (ADMIN 전용)
   * POST /api/approve
   */
  async handleApprove(actor: User, params: { userId: string; approved: boolean }) {
    // 1. 권한 검증 (PermissionService)
    this.permissionService.ensureCanApprove(actor);

    // 2. 대상 사용자 로드 (UserService)
    const user = await this.userService.findById(params.userId);
    if (!user.isRoot()) {
      throw new BadRequestException('Only ROOT users can be approved');
    }

    // 3. 승인/거절 처리
    if (params.approved) {
      // 그룹 생성 (GroupService)
      const group = await this.groupService.createForRoot(user);
      user.approve(group.id);

      // 저장 (UserService)
      const saved = await this.userService.save(user);

      return {
        message: 'Root approved',
        user: saved.toResponse(),
        groupCode: group.code.getValue(),
        groupName: group.name,
      };
    } else {
      user.reject();
      const saved = await this.userService.save(user);

      return {
        message: 'Root rejected',
        user: saved.toResponse(),
      };
    }
  }

  /**
   * 승인 대기 ROOT 목록 (ADMIN 전용)
   * POST /api/pending
   */
  async handlePending(actor: User, _params: any) {
    // 1. 권한 검증 (PermissionService)
    this.permissionService.ensureCanApprove(actor);

    // 2. 조회 (UserService)
    const roots = await this.userService.findPending();

    return {
      roots: roots.map((r) => r.toResponse()),
    };
  }

  /**
   * 그룹 사용자 목록 조회
   * GET /api/users
   */
  async queryUsers(actor: User, _params: any) {
    // 1. 그룹 멤버 조회 (UserService)
    const users = await this.userService.findByGroup(actor.groupId!);

    return {
      users: users.map((u) => u.toResponse()),
    };
  }
}
