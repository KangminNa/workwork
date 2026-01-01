/**
 * 테스트 환경 초기 설정
 * test.json 설정 파일을 사용하며, 필요시 환경 변수로 오버라이드 가능
 */
// 테스트 환경 설정
process.env.NODE_ENV = 'test';

// 타임존 설정
process.env.TZ = 'Asia/Seoul';

// 타임아웃 설정 (30초)
jest.setTimeout(30000);

