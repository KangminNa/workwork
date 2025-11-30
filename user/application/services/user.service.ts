import { Injectable } from '@nestjs/common';
import { BaseService } from '@workwork/base';
import { UserGreeting } from '../../domain/models/user-greeting.entity';
import { UserGreetingDto } from '../../shared/dto/user-greeting.dto';
import { UserRepository } from '../../infrastructure/user.repository';

@Injectable()
export class UserService extends BaseService<UserGreeting> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  getGreeting(): UserGreetingDto {
    return this.findById('user-default');
  }

  findByEmail(email: string) {
    const user = this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
