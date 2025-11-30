import { Module } from '@nestjs/common';
import { UserController } from '../interface/http/user.controller';
import { UserService } from '../application/services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
