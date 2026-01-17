import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Delete,
  Patch,
  Param,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, CreateUserDto, UpdateUserDto, DeleteUserDto, ApproveRootDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Root 회원가입 (ADMIN 승인 필요)
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    const { email, username, password } = signupDto;
    return this.authService.signup(email, username, password);
  }

  /**
   * 로그인
   * - ROOT/ADMIN: email + password
   * - USER: username + groupCode + password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { email, username, groupCode, password } = loginDto;
    return this.authService.login(email, username, groupCode, password);
  }

  /**
   * ADMIN이 Root 승인/거절
   * TODO: JWT Guard 추가하여 adminUserId를 토큰에서 추출
   */
  @Patch('approve-root/:rootUserId')
  @HttpCode(HttpStatus.OK)
  async approveRoot(
    @Param('rootUserId') rootUserId: string,
    @Body() approveRootDto: ApproveRootDto,
  ) {
    return this.authService.approveRoot(
      approveRootDto.adminUserId,
      rootUserId,
      approveRootDto.approved,
    );
  }

  /**
   * ADMIN이 승인 대기 중인 Root 목록 조회
   * TODO: JWT Guard 추가
   */
  @Get('pending-roots/:adminUserId')
  @HttpCode(HttpStatus.OK)
  async getPendingRoots(@Param('adminUserId') adminUserId: string) {
    return this.authService.getPendingRoots(adminUserId);
  }

  /**
   * Root가 사용자 생성
   * TODO: JWT Guard 추가하여 rootUserId를 토큰에서 추출
   */
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { rootUserId, username, password } = createUserDto;
    return this.authService.createUser(rootUserId, username, password);
  }

  /**
   * Root의 그룹 내 사용자 목록 조회
   * TODO: JWT Guard 추가
   */
  @Get('users/:rootUserId')
  @HttpCode(HttpStatus.OK)
  async getGroupUsers(@Param('rootUserId') rootUserId: string) {
    return this.authService.getGroupUsers(rootUserId);
  }

  /**
   * 사용자 수정 (Root만 가능)
   * TODO: JWT Guard 추가
   */
  @Patch('users/:userId')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(
      updateUserDto.rootUserId,
      userId,
      updateUserDto.username,
      updateUserDto.password,
    );
  }

  /**
   * 사용자 삭제 (Root만 가능)
   * TODO: JWT Guard 추가
   */
  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('userId') userId: string,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.authService.deleteUser(deleteUserDto.rootUserId, userId);
  }
}
