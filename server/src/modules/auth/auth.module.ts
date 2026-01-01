import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler, RegisterHandler } from './handlers';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { JwtUtil } from '../../common/utils/jwt.util';
import { ConfigLoader } from '../../config/config.loader';

@Module({
  imports: [
    UsersModule,
    WorkspacesModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const config = ConfigLoader.get();
        return {
          secret: config.jwt.secret,
          signOptions: { expiresIn: config.jwt.expirationTime },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginHandler,
    RegisterHandler,
    {
      provide: 'JWT_INIT',
      useFactory: (jwtService: JwtService) => {
        JwtUtil.init(jwtService);
        return null;
      },
      inject: [JwtService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

