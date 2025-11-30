import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { UserGreeting } from '../domain/models/user-greeting.entity';

@Injectable()
export class UserRepository extends BaseInMemoryRepository<UserGreeting> {
  constructor() {
    super([
      {
        id: 'user-default',
        message: 'User module reporting for duty',
        email: 'user@example.com',
        createdAt: new Date(),
      },
    ]);
  }

  findByEmail(email: string) {
    return this.findAll().find((user) => user.email === email);
  }
}
