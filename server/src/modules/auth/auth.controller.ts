import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BaseController } from '../../common/abstracts/base.controller';
import {
  ILoginInput,
  IRegisterInput,
  IBaseResponse,
  IAuthResult,
} from '../../common/types';
import { AuthService } from './auth.service';

/**
 * Auth Controller
 * - 회원가입 / 로그인 API
 * - BaseController 패턴 사용
 */
@Controller('auth')
export class AuthController extends BaseController<AuthService> {
  constructor(service: AuthService) {
    super(service);
  }

  /**
   * 로그인
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: ILoginInput,
  ): Promise<IBaseResponse<IAuthResult>> {
    const context = this.createContext();
    const result = await this.service.login(input, context);
    return this.success(result, context);
  }

  /**
   * 회원가입
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() input: IRegisterInput,
  ): Promise<IBaseResponse<IAuthResult>> {
    const context = this.createContext();
    const result = await this.service.register(input, context);
    return this.success(result, context);
  }
}

