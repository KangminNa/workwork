import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { jwtConfig } from '../../../config';

// Controllers
import { LoginController } from './login.controller';

// Services
import { UserService } from './services/user.service';
import { GroupService } from './services/group.service';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';

// Repositories
import { UserRepository } from './repos/user.repository';
import { GroupRepository } from './repos/group.repository';

// Strategies & Guards
import { JwtStrategy } from '../../core/strategies/jwt.strategy';

/**
 * Login Module
 * - 인증 + 사용자 관리 통합
 * - Service 모듈화 (User, Group, Auth, Permission)
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [LoginController],
  providers: [
    // Core
    PrismaService,
    CryptoUtil,
    JwtStrategy,

    // Services (모듈화)
    UserService,
    GroupService,
    AuthService,
    PermissionService,

    // Repositories
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IGroupRepository',
      useClass: GroupRepository,
    },
  ],
  exports: [
    UserService,
    GroupService,
    AuthService,
    PermissionService,
    'IUserRepository',
    'IGroupRepository',
  ],
})
export class LoginModule {}
