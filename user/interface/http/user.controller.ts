import { Controller, Get, Query } from '@nestjs/common';
import { BaseController } from '@workwork/base';
import { UserService } from '../../application/services/user.service';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Get('hello')
  sayHello() {
    return this.success(this.userService.getGreeting());
  }

  @Get('find')
  findByEmail(@Query('email') email: string) {
    try {
      return this.success(this.userService.findByEmail(email));
    } catch (error) {
      return this.failure((error as Error).message, 404);
    }
  }
}
