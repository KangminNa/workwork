import { Module } from '@nestjs/common';
import { AuthController } from '../interface/http/auth.controller';
import { AuthService } from '../application/services/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
