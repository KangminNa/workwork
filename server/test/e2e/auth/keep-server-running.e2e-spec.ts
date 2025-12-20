import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

/**
 * 서버 유지 테스트 - 가장 확실한 DB 데이터 확인 방법
 * - 테스트 완료 후에도 서버를 계속 실행
 * - Ctrl+C로 수동 종료할 때까지 DB 데이터 유지
 */
describe('서버 유지 - DB 데이터 확인 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true);
    
    console.log('');
    console.log('🚀 서버 시작 - DB 데이터 유지 모드');
    console.log('');
  });

  afterAll(async () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 테스트 완료! 서버를 계속 실행합니다...');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 DB 데이터 확인 방법:');
    console.log('');
    console.log('   # 방법 1: psql 접속');
    console.log('   docker exec -it workwork-postgres-test psql -U postgres -d workwork_test');
    console.log('');
    console.log('   # 방법 2: SQL 직접 실행');
    console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛑 종료하려면 Ctrl+C를 누르세요');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    // 무한 대기 - 사용자가 Ctrl+C로 종료할 때까지
    await new Promise(() => {});
  });

  afterEach(async () => {
    // DB 삭제 안 함
    await TestAppHelper.resetDatabase();
  });

  it('✅ Owner 사용자 생성', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'owner@example.com',
        password: 'password123',
        name: 'Owner사용자',
      })
      .expect(201);

    console.log('');
    console.log('✅ Owner 생성 완료:');
    console.log('   User ID:', response.body.user.id);
    console.log('   Email:', response.body.user.email);
    console.log('   Workspace ID:', response.body.workspace.id);
    console.log('   Invite Code:', response.body.workspace.inviteCode);
    console.log('');

    expect(response.body.user.role).toBe('owner');
  });

  it('✅ Member 사용자 생성', async () => {
    // 1. Owner 생성
    const ownerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: TestDataHelper.randomEmail(),
        password: 'password123',
        name: 'Team Owner',
      })
      .expect(201);

    const inviteCode = ownerResponse.body.workspace.inviteCode;

    // 2. Member 생성
    const memberResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'member@example.com',
        password: 'password123',
        name: 'Member사용자',
        inviteCode,
      })
      .expect(201);

    console.log('');
    console.log('✅ Member 생성 완료:');
    console.log('   Owner ID:', ownerResponse.body.user.id);
    console.log('   Member ID:', memberResponse.body.user.id);
    console.log('   Workspace ID:', ownerResponse.body.workspace.id);
    console.log('   Invite Code:', inviteCode);
    console.log('');

    expect(memberResponse.body.user.role).toBe('member');
  });

  it('✅ 여러 사용자 생성 (10명)', async () => {
    const users = [];

    for (let i = 1; i <= 10; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `user${i}@example.com`,
          password: 'password123',
          name: `사용자${i}`,
        })
        .expect(201);

      users.push(response.body.user);
    }

    console.log('');
    console.log('✅ 10명의 사용자 생성 완료');
    console.log('   User IDs:', users.map(u => u.id).join(', '));
    console.log('   총 사용자 수:', users.length);
    console.log('');

    expect(users).toHaveLength(10);
  });
});

