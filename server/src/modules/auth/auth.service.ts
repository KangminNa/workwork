import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/abstracts/base.service';
import {
  ILoginInput,
  IRegisterInput,
  IAuthResult,
  IRequestContext,
} from '../../common/types';
import { LoginHandler, RegisterHandler } from './handlers';

/**
 * Auth Service
 * - Handler 실행만 담당
 * - BaseService 패턴 사용
 */
@Injectable()
export class AuthService extends BaseService<{
  login: LoginHandler;
  register: RegisterHandler;
}> {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly registerHandler: RegisterHandler,
  ) {
    super({ login: loginHandler, register: registerHandler } as any);
  }

  /**
   * 로그인
   */
  async login(
    input: ILoginInput,
    context: IRequestContext,
  ): Promise<IAuthResult> {
    return this.execute(this.loginHandler.execute.bind(this.loginHandler), input, context as any);
  }

  /**
   * 회원가입
   */
  async register(
    input: IRegisterInput,
    context: IRequestContext,
  ): Promise<IAuthResult> {
    return this.execute(this.registerHandler.execute.bind(this.registerHandler), input, context as any);
  }
}

