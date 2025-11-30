import { Injectable } from '@nestjs/common';
import { AuthGreeting } from '../../domain/models/auth-greeting.entity';
import { AuthGreetingDto } from '../../shared/dto/auth-greeting.dto';

@Injectable()
export class AuthService {
  getGreeting(): AuthGreetingDto {
    const greeting: AuthGreeting = {
      message: 'Auth module says hello',
    };

    return greeting;
  }
}
