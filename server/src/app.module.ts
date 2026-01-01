import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // 환경 변수 설정 (여전히 .env 지원)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 데이터베이스 설정 (JSON config 사용)
    TypeOrmModule.forRoot(getDatabaseConfig()),
    // 기능 모듈
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

