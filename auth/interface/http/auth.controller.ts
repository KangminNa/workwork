import { Controller, Get } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { AuthGreetingDto } from '../../shared/dto/auth-greeting.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('hello')
  getHello(): AuthGreetingDto {
    return this.authService.getGreeting();
  }
}
