import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { AuthGreeting } from '../../domain/models/auth-greeting.entity';
import { AuthGreetingDto } from '../../shared/dto/auth-greeting.dto';
import { AuthRepository } from '../../infrastructure/auth.repository';

@Injectable()
export class AuthService extends BaseService<AuthGreeting> {
  constructor(private readonly authRepository: AuthRepository) {
    super(authRepository);
  }

  getGreeting(): AuthGreetingDto {
    return this.save({
      id: 'auth-default',
      message: 'Auth module says hello',
      updatedAt: new Date(),
    });
  }
}
