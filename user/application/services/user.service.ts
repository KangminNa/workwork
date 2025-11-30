import { Injectable } from '@nestjs/common';
import { UserGreeting } from '../../domain/models/user-greeting.entity';
import { UserGreetingDto } from '../../shared/dto/user-greeting.dto';

@Injectable()
export class UserService {
  getGreeting(): UserGreetingDto {
    const greeting: UserGreeting = {
      message: 'User module reporting for duty',
    };
    return greeting;
  }
}
