import { Module } from '@nestjs/common';
import { BaseModule } from '@workwork/base/server/base.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService, AuthRepository],
})
export class AuthModule extends BaseModule {
  protected moduleName = 'AuthModule';
}
