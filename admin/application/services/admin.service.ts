import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { AdminGreeting } from '../../domain/models/admin-greeting.entity';
import { AdminGreetingDto } from '../../shared/dto/admin-greeting.dto';
import { AdminRepository } from '../../infrastructure/admin.repository';

@Injectable()
export class AdminService extends BaseService<AdminGreeting> {
  constructor(private readonly adminRepository: AdminRepository) {
    super(adminRepository);
  }

  getGreeting(): AdminGreetingDto {
    return this.findById('admin-default');
  }
}
