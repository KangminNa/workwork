import { Injectable } from '@nestjs/common';
import { AdminGreeting } from '../../domain/models/admin-greeting.entity';
import { AdminGreetingDto } from '../../shared/dto/admin-greeting.dto';

@Injectable()
export class AdminService {
  getGreeting(): AdminGreetingDto {
    const greeting: AdminGreeting = {
      message: 'Admin module controls the system',
    };
    return greeting;
  }
}
