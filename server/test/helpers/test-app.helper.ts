import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../../src/app.module';
import { TestDatabaseHelper } from './test-database.helper';

/**
 * E2E 테스트를 위한 NestJS 앱 초기화 헬퍼
 * 모든 E2E 테스트에서 공통으로 사용되는 앱 설정을 관리합니다.
 */
export class TestAppHelper {
  private static app: INestApplication;
  private static configService: ConfigService;
  private static skipCleanup = false; // DB 삭제 생략 플래그

  /**
   * DB 삭제 플래그 설정
   * @param skip true면 afterEach에서 DB 삭제를 하지 않음
   */
  static setSkipCleanup(skip: boolean): void {
    this.skipCleanup = skip;
  }

  /**
   * 환경 변수로 DB 유지 여부 확인
   */
  static shouldKeepData(): boolean {
    return process.env.KEEP_TEST_DATA === 'true' || this.skipCleanup;
  }

  /**
   * NestJS 애플리케이션 초기화
   * - ConfigModule 설정
   * - ValidationPipe 설정
   * - 글로벌 Prefix 설정
   * - 데이터베이스 연결 및 초기화
   */
  static async initialize(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: './test/.env.test',
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    // Validation Pipe 설정
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API Prefix 설정
    this.app.setGlobalPrefix('api');

    this.configService = this.app.get(ConfigService);

    // 테스트 데이터베이스 연결
    await TestDatabaseHelper.connect(this.configService);
    await TestDatabaseHelper.cleanDatabase();

    await this.app.init();

    return this.app;
  }

  /**
   * 애플리케이션 종료 및 리소스 정리
   * KEEP_TEST_DATA=true 이면 DB를 정리하지 않고 연결만 끊음
   */
  static async cleanup(): Promise<void> {
    // 데이터 유지 플래그가 설정되어 있지 않으면 마지막 정리
    if (!this.shouldKeepData()) {
      await TestDatabaseHelper.cleanDatabase();
    } else {
      console.log('⚠️  cleanup: 데이터 유지 모드 - DB 정리 생략');
    }
    
    await TestDatabaseHelper.disconnect();
    if (this.app) {
      await this.app.close();
    }
  }

  /**
   * 각 테스트 후 데이터베이스 초기화
   * KEEP_TEST_DATA=true 환경 변수가 설정되어 있으면 삭제하지 않음
   */
  static async resetDatabase(): Promise<void> {
    if (this.shouldKeepData()) {
      console.log('⚠️  DB 삭제 생략 (KEEP_TEST_DATA=true 또는 skipCleanup=true)');
      return;
    }
    await TestDatabaseHelper.cleanDatabase();
    await TestDatabaseHelper.resetSequences();
  }

  /**
   * 강제로 DB 초기화 (플래그 무시)
   */
  static async forceResetDatabase(): Promise<void> {
    await TestDatabaseHelper.fullReset();
  }

  /**
   * 현재 앱 인스턴스 반환
   */
  static getApp(): INestApplication {
    return this.app;
  }

  /**
   * ConfigService 인스턴스 반환
   */
  static getConfigService(): ConfigService {
    return this.configService;
  }
}

