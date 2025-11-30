import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base';
import { AuthController } from '../interface/http/auth.controller';
import { AuthService } from '../application/services/auth.service';
import { AuthRepository } from '../infrastructure/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule extends BaseModule {
  protected moduleName = 'AuthModule';
}
