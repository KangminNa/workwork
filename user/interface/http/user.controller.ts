import { Controller, Get } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UserGreetingDto } from '../../shared/dto/user-greeting.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('hello')
  sayHello(): UserGreetingDto {
    return this.userService.getGreeting();
  }
}
