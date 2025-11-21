/**
 * Signup Submit Controller
 * 회원가입 처리 (POST) + 관리자 알림
 */

import { Request, Response } from 'express';
import { BaseController } from '../../../core/server/controllers/BaseController';
import { SignupService } from '../services/SignupService';
import { SignupRequest } from '../../shared/types';

export class SignupSubmitController extends BaseController {
  constructor(private readonly signupService: SignupService) {
    super();
  }

  protected async executeImpl(req: Request, res: Response): Promise<void> {
    const payload: SignupRequest = {
      email: req.body['signup-email'],
      username: req.body['signup-username'],
      password: req.body['signup-password'],
      name: req.body['signup-name'],
    };

    const user = await this.signupService.register(payload);

    this.created(res, {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      message: '회원가입이 완료되었습니다. 로그인 해주세요.',
      redirectTo: '/login',
    });
  }
}
