import { Module } from '@nestjs/common';
import { LoginModule } from './modules/login/login.module';

/**
 * App Module
 * - 도메인 로직은 각 모듈에 위치
 */
@Module({
  imports: [LoginModule],
})
export class AppModule {}
