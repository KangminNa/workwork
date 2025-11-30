import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base/server/repositories/base.in-memory.repository';
import { AuthUser } from '../entities/auth-user.entity';

@Injectable()
export class AuthRepository extends BaseInMemoryRepository<AuthUser> {
  constructor() {
    super([]);
  }

  findByUsername(username: string): AuthUser | undefined {
    return this.findAll().find((user) => user.username === username);
  }

  findByEmail(email: string): AuthUser | undefined {
    return this.findAll().find((user) => user.email === email);
  }
}
