import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../core/external/prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { jwtConfig } from '../../../config';
import { JwtStrategy } from '../../core/http/jwt.strategy';
import { LoginController } from './controllers/login.controller';
import { UserQueryService } from './services/user-query.service';
import { UserCommandService } from './services/user-command.service';
import { GroupService } from './services/group.service';
import { AuthService } from './services/auth.service';
import { AuthUseCase } from './services/usecases/auth.usecase';
import { UserAdminUseCase } from './services/usecases/user-admin.usecase';
import { UserQueryUseCase } from './services/usecases/user-query.usecase';
import { UserRepository } from './repositories/user.repository';
import { GroupRepository } from './repositories/group.repository';
import { UserCache } from './repositories/user.cache';
import { CachedUserRepository } from './repositories/user.cached.repository';
import { UserPolicy } from './policies/user.policy';

/**
 * Login Module
 * - 인증 + 사용자 관리 통합
 * - 도메인 로직은 모듈에 위치
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
    PrismaService,
    CryptoUtil,
    JwtStrategy,
    UserQueryService,
    UserCommandService,
    GroupService,
    AuthService,
    AuthUseCase,
    UserAdminUseCase,
    UserQueryUseCase,
    UserPolicy,
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
