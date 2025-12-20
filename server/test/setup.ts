/**
 * 테스트 환경 초기 설정
 */
// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_DATABASE = 'workwork_test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRES_IN = '7d';

// 타임존 설정
process.env.TZ = 'Asia/Seoul';

// 타임아웃 설정 (30초)
jest.setTimeout(30000);

