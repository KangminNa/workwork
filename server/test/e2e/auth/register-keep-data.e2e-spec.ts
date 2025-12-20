import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

/**
 * DB 삭제 플래그 테스트 예제
 * - 이 테스트는 DB 데이터를 삭제하지 않습니다
 * - 테스트 실행 후 DB에 데이터가 남아있는 것을 확인할 수 있습니다
 */
describe('회원가입 - DB 데이터 유지 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // ✅ 이 테스트에서는 DB 삭제를 하지 않음
    TestAppHelper.setSkipCleanup(true);
    
    console.log('🔧 DB 삭제 플래그 설정: skipCleanup = true');
    console.log('📌 이 테스트 후 DB 데이터가 유지됩니다!');
  });

  afterAll(async () => {
    console.log('');
    console.log('🎉 테스트 완료! DB 데이터 확인 방법:');
    console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"');
    console.log('');
    console.log('⏸️  5초 대기 중... (DB 확인 시간)');
    
    // 5초 대기 (사용자가 DB를 확인할 시간)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('');
    console.log('🗑️  이제 정리합니다...');
    
    // 테스트 종료 시 플래그 원복
    TestAppHelper.setSkipCleanup(false);
    
    // 원한다면 여기서 강제로 삭제 가능
    // await TestAppHelper.forceResetDatabase();
    
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // skipCleanup=true 이므로 DB 삭제되지 않음
    await TestAppHelper.resetDatabase();
  });

  it('✅ Owner로 회원가입 - 데이터 유지됨', async () => {
    const registerDto = {
      email: TestDataHelper.randomEmail(),
      password: 'password123',
      name: '데이터유지테스트',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto)
      .expect(201);

    console.log('✅ 생성된 사용자:', {
      id: response.body.user.id,
      email: response.body.user.email,
      name: response.body.user.name,
    });

    console.log('📝 테스트 후 DB에서 확인해보세요:');
    console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT id, email, name FROM users WHERE name = \'데이터유지테스트\';"');

    expect(response.body.user.email).toBe(registerDto.email);
  });

  it('✅ Member로 회원가입 - 데이터 유지됨', async () => {
    // 1. Owner 생성
    const ownerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: TestDataHelper.randomEmail(),
        password: 'password123',
        name: 'Owner-데이터유지',
      })
      .expect(201);

    const inviteCode = ownerResponse.body.workspace.inviteCode;

    // 2. Member 생성
    const memberResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: TestDataHelper.randomEmail(),
        password: 'password123',
        name: 'Member-데이터유지',
        inviteCode,
      })
      .expect(201);

    console.log('✅ Owner와 Member 생성됨:');
    console.log('   Owner ID:', ownerResponse.body.user.id);
    console.log('   Member ID:', memberResponse.body.user.id);
    console.log('   Workspace ID:', ownerResponse.body.workspace.id);

    expect(memberResponse.body.user.role).toBe('member');
  });
});

