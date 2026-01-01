import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // 환경 변수 설정 (여전히 .env 지원)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 기능 모듈
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
