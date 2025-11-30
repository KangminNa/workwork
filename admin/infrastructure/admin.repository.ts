import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from '@workwork/base';
import { AdminGreeting } from '../domain/models/admin-greeting.entity';

@Injectable()
export class AdminRepository extends BaseInMemoryRepository<AdminGreeting> {
  constructor() {
    super([
      {
        id: 'admin-default',
        message: 'Admin module controls the system',
        createdAt: new Date(),
      },
    ]);
  }
}
