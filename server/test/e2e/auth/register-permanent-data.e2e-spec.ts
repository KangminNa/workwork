import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

/**
 * 영구 데이터 유지 테스트
 * - afterAll에서도 DB를 정리하지 않음
 * - 테스트 완료 후에도 DB에 데이터가 남아있음
 */
describe('회원가입 - 영구 데이터 유지 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // ✅ DB 삭제 비활성화
    TestAppHelper.setSkipCleanup(true);
    
    console.log('');
    console.log('🔧 영구 데이터 유지 모드 활성화');
    console.log('📌 이 테스트는 afterAll에서도 DB를 정리하지 않습니다!');
    console.log('');
  });

  afterAll(async () => {
    console.log('');
    console.log('🎉 테스트 완료!');
    console.log('');
    console.log('📊 DB 데이터 확인:');
    console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT id, email, name, role FROM users;"');
    console.log('');
    console.log('🗑️  정리 방법:');
    console.log('   npm run test:e2e:clean');
    console.log('');
    
    // ⚠️ 플래그를 원복하지 않음 - 데이터 영구 유지
    // TestAppHelper.setSkipCleanup(false);
    
    // ⚠️ cleanup도 호출하지 않음 - 데이터 보존
    // await TestAppHelper.cleanup();
    
    // 앱만 종료
    if (app) {
      await app.close();
    }
  });

  afterEach(async () => {
    // skipCleanup=true 이므로 삭제되지 않음
    await TestAppHelper.resetDatabase();
  });

  it('✅ 영구 데이터 생성 - Owner', async () => {
    const registerDto = {
      email: 'permanent-owner@example.com',
      password: 'password123',
      name: '영구보존Owner',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto)
      .expect(201);

    console.log('');
    console.log('✅ 영구 보존 Owner 생성:');
    console.log('   ID:', response.body.user.id);
    console.log('   Email:', response.body.user.email);
    console.log('   Workspace ID:', response.body.workspace.id);
    console.log('   Invite Code:', response.body.workspace.inviteCode);
    console.log('');

    expect(response.body.user.email).toBe(registerDto.email);
  });

  it('✅ 영구 데이터 생성 - Member', async () => {
    // 1. Owner 생성
    const ownerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'permanent-owner2@example.com',
        password: 'password123',
        name: '영구보존Owner2',
      })
      .expect(201);

    const inviteCode = ownerResponse.body.workspace.inviteCode;

    // 2. Member 생성
    const memberResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'permanent-member@example.com',
        password: 'password123',
        name: '영구보존Member',
        inviteCode,
      })
      .expect(201);

    console.log('');
    console.log('✅ 영구 보존 Member 생성:');
    console.log('   Owner ID:', ownerResponse.body.user.id);
    console.log('   Member ID:', memberResponse.body.user.id);
    console.log('   Workspace ID:', ownerResponse.body.workspace.id);
    console.log('   Invite Code:', inviteCode);
    console.log('');

    expect(memberResponse.body.user.role).toBe('member');
  });

  it('✅ 여러 사용자 생성', async () => {
    const users = [];
    
    for (let i = 1; i <= 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `permanent-user${i}@example.com`,
          password: 'password123',
          name: `영구보존사용자${i}`,
        })
        .expect(201);
      
      users.push(response.body.user);
    }

    console.log('');
    console.log('✅ 5명의 영구 보존 사용자 생성 완료');
    console.log('   User IDs:', users.map(u => u.id).join(', '));
    console.log('');

    expect(users).toHaveLength(5);
  });
});

