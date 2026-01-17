import { Controller } from '@nestjs/common';
import { BaseController } from '../../../core/controllers/base.controller';
import { PublicActions } from '../../../core/decorators/public-actions.decorator';
import { AuthUseCase } from '../services/usecases/auth.usecase';
import { UserAdminUseCase } from '../services/usecases/user-admin.usecase';
import { UserQueryUseCase } from '../services/usecases/user-query.usecase';
import { User } from '../models/entities/user.entity';
import { SignupDto, LoginDto, ApproveRootDto } from '../dtos/auth.dto';
import { CreateUserDto, UpdateUserRequestDto, DeleteUserRequestDto } from '../dtos/user.dto';
import { ActionDto } from '../../../core/decorators/action-dto.decorator';

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
    private readonly authUseCase: AuthUseCase,
    private readonly userAdminUseCase: UserAdminUseCase,
    private readonly userQueryUseCase: UserQueryUseCase,
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
  @ActionDto(SignupDto)
  async handleSignup(_actor: User | null, params: SignupDto) {
    return this.authUseCase.signup(params);
  }

  /**
   * 로그인
   * POST /api/login
   */
  @ActionDto(LoginDto)
  async handleLogin(_actor: User | null, params: LoginDto) {
    return this.authUseCase.login(params);
  }

  // ============================================
  // 인증 필요 엔드포인트
  // ============================================

  /**
   * 사용자 생성 (ROOT가 USER 생성)
   * POST /api/create
   */
  @ActionDto(CreateUserDto)
  async handleCreate(actor: User, params: CreateUserDto) {
    return this.userAdminUseCase.createUser(actor, params);
  }

  /**
   * 사용자 수정
   * POST /api/update
   */
  @ActionDto(UpdateUserRequestDto)
  async handleUpdate(actor: User, params: UpdateUserRequestDto) {
    return this.userAdminUseCase.updateUser(actor, params);
  }

  /**
   * 사용자 삭제
   * POST /api/delete
   */
  @ActionDto(DeleteUserRequestDto)
  async handleDelete(actor: User, params: DeleteUserRequestDto) {
    return this.userAdminUseCase.deleteUser(actor, params);
  }

  /**
   * ROOT 승인/거절 (ADMIN 전용)
   * POST /api/approve
   */
  @ActionDto(ApproveRootDto)
  async handleApprove(actor: User, params: ApproveRootDto) {
    return this.userAdminUseCase.approveRoot(actor, params);
  }

  /**
   * 승인 대기 ROOT 목록 (ADMIN 전용)
   * POST /api/pending
   */
  async handlePending(actor: User, _params: any) {
    return this.userAdminUseCase.pendingRoots(actor);
  }

  /**
   * 그룹 사용자 목록 조회
   * GET /api/users
   */
  async queryUsers(actor: User, _params: any) {
    return this.userQueryUseCase.listUsers(actor);
  }
}
