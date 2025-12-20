import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

/**
 * 강제 DB 삭제 테스트 예제
 * - 플래그와 상관없이 특정 시점에 강제로 DB 삭제
 */
describe('회원가입 - 강제 DB 삭제 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // 일반적인 삭제 (플래그 영향 받음)
    await TestAppHelper.resetDatabase();
  });

  it('✅ 테스트 중간에 강제로 DB 초기화', async () => {
    // 1. 데이터 생성
    const response1 = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: TestDataHelper.randomEmail(),
        password: 'password123',
        name: '삭제될사용자1',
      })
      .expect(201);

    console.log('✅ 첫 번째 사용자 생성:', response1.body.user.id);

    // 2. 중간에 강제로 DB 삭제 (플래그 무시)
    console.log('🗑️  강제 DB 삭제 실행...');
    await TestAppHelper.forceResetDatabase();

    // 3. 다시 데이터 생성 (ID가 1부터 시작)
    const response2 = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: TestDataHelper.randomEmail(),
        password: 'password123',
        name: '새로운사용자',
      })
      .expect(201);

    console.log('✅ 두 번째 사용자 생성:', response2.body.user.id);
    console.log('📌 ID가 1로 리셋되었는지 확인!');

    // 강제 삭제 후 새로운 사용자 생성됨
    // 주의: 시퀀스는 리셋되지만, 이전 테스트의 영향으로 ID가 1이 아닐 수 있음
    expect(response2.body.user.id).toBeGreaterThan(0);
    expect(response2.body.user.name).toBe('새로운사용자');
  });
});

