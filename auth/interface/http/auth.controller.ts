import { Controller, Get } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { AuthService } from '../../application/services/auth.service';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Get('hello')
  getHello() {
    const data = this.authService.getGreeting();
    return this.success(data);
  }
}
