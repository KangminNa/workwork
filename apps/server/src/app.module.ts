import { Module } from '@nestjs/common';
import { LoginModule } from './modules/login/login.module';

/**
 * App Module
 * - LoginModule로 User + Group 통합
 */
@Module({
  imports: [LoginModule],
})
export class AppModule {}
