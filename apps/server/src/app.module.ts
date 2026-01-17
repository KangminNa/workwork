import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './modules/login/login.module';

/**
 * App Module
 * - LoginModule로 User + Group 통합
 */
@Module({
  imports: [LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

