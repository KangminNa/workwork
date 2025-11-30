import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BaseController } from '@workwork/base/server/base.controller';
import { LoginUserDto, RegisterUserDto } from '@workwork/auth/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    try {
      const data = this.authService.register(dto);
      return this.success({
        message: '가입 신청이 접수되었습니다. 관리자 승인 후 이용해주세요.',
        user: data,
      });
    } catch (error) {
      return this.failure((error as Error).message);
    }
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    try {
      const data = this.authService.login(dto);
      return this.success({
        message: '로그인 성공',
        user: data,
      });
    } catch (error) {
      return this.failure((error as Error).message, 401);
    }
  }

  @Post('approve')
  approve(@Body('username') username: string, @Body('token') token: string) {
    try {
      const data = this.authService.approve(username, token);
      return this.success({
        message: `${username}님이 승인되었습니다.`,
        user: data,
      });
    } catch (error) {
      return this.failure((error as Error).message, 403);
    }
  }

  @Get('pending')
  pending(@Query('token') token: string) {
    try {
      return this.success(this.authService.pending(token));
    } catch (error) {
      return this.failure((error as Error).message, 403);
    }
  }
}
