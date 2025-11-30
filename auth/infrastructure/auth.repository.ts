import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { AuthGreeting } from '../domain/models/auth-greeting.entity';

@Injectable()
export class AuthRepository extends BaseInMemoryRepository<AuthGreeting> {
  constructor() {
    super([
      {
        id: 'auth-default',
        message: 'Auth module says hello',
        createdAt: new Date(),
      },
    ]);
  }
}
