import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { UserController } from '../interface/http/user.controller';
import { UserService } from '../application/services/user.service';
import { UserRepository } from '../infrastructure/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule extends BaseModule {
  protected moduleName = 'UserModule';
}
