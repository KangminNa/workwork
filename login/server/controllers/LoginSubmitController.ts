/**
 * Login Submit Controller
 * 로그인 처리 (POST)
 */

import { Request, Response } from 'express';
import { BaseController } from '../../../core/server/controllers/BaseController';
import { UserService } from '../services/UserService';

export class LoginSubmitController extends BaseController {
  private userService = new UserService();

  protected async executeImpl(req: Request, res: Response): Promise<void> {
    try {
      const { 'login-email': email, 'login-password': password } = req.body;

      // Validation
      if (!email || !password) {
        this.clientError(res, 'Email and password are required');
        return;
      }

      // 로그인 시도
      const user = await this.userService.login(email, password);

      if (!user) {
        this.unauthorized(res, 'Invalid email or password');
        return;
      }

      // 성공 응답
      // TODO: 실제로는 JWT 토큰 생성 또는 세션 설정
      this.ok(res, {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        // token: generateJWT(user),
      });
    } catch (error: any) {
      console.error('[LoginSubmit] Error:', error);
      this.fail(res, error.message || 'Login failed');
    }
  }
}

