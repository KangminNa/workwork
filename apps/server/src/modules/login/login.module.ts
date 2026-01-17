import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { jwtConfig } from '../../../config';

// Controllers
import { LoginController } from './controllers/login.controller';

// Services
import { UserQueryService } from './services/user-query.service';
import { UserCommandService } from './services/user-command.service';
import { GroupService } from './services/group.service';
import { AuthService } from './services/auth.service';
import { AuthUseCase } from './services/usecases/auth.usecase';
import { UserAdminUseCase } from './services/usecases/user-admin.usecase';
import { UserQueryUseCase } from './services/usecases/user-query.usecase';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { GroupRepository } from './repositories/group.repository';
import { UserCache } from './repositories/user.cache';
import { CachedUserRepository } from './repositories/user.cached.repository';
import { UserPolicy } from './policies/user.policy';

// Strategies & Guards
import { JwtStrategy } from '../../core/strategies/jwt.strategy';

/**
 * Login Module
 * - 인증 + 사용자 관리 통합
 * - Service/UseCase 모듈화 (User, Group, Auth, UseCase)
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
    UserQueryService,
    UserCommandService,
    GroupService,
    AuthService,
    AuthUseCase,
    UserAdminUseCase,
    UserQueryUseCase,
    UserPolicy,

    // Repositories
    UserRepository,
    GroupRepository,
    UserCache,
    CachedUserRepository,
    {
      provide: 'IUserRepository',
      useExisting: CachedUserRepository,
    },
    {
      provide: 'IGroupRepository',
      useExisting: GroupRepository,
    },
  ],
  exports: [
    UserQueryService,
    UserCommandService,
    GroupService,
    AuthService,
    AuthUseCase,
    UserAdminUseCase,
    UserQueryUseCase,
    'IUserRepository',
    'IGroupRepository',
  ],
})
export class LoginModule {}
