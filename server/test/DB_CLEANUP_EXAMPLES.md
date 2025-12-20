# 🎯 DB 삭제 플래그 실전 예제

## 📌 빠른 시작

### 1. 기본 사용 (DB 자동 삭제)
```bash
# 일반적인 테스트 실행
npm run test:e2e

# afterEach에서 자동으로 DB 삭제됨
```

### 2. 데이터 유지 (전역)
```bash
# 모든 테스트에서 DB 삭제 안 함
npm run test:e2e:keep

# 또는
KEEP_TEST_DATA=true npm run test:e2e
```

### 3. 특정 테스트만 데이터 유지
```bash
# register-keep-data 테스트만 실행 (데이터 유지)
npm run test:e2e:keep -- register-keep-data
```

### 4. DB 수동 정리
```bash
# 언제든지 DB 초기화
npm run test:e2e:clean
```

## 🔧 코드 예제

### 예제 1: 기본 테스트 (자동 삭제)

```typescript
// test/e2e/auth/register.e2e-spec.ts
describe('회원가입 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // ✅ 기본: 매 테스트 후 DB 자동 삭제
    await TestAppHelper.resetDatabase();
  });

  it('회원가입 성공', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: '홍길동',
      });

    expect(response.status).toBe(201);
    // 이 테스트 후 DB가 자동으로 정리됨
  });
});
```

### 예제 2: 데이터 유지 테스트

```typescript
// test/e2e/auth/register-keep-data.e2e-spec.ts
describe('회원가입 - 데이터 유지 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // ✅ 이 테스트 파일에서는 DB 삭제 안 함
    TestAppHelper.setSkipCleanup(true);
    console.log('📌 DB 삭제 비활성화 - 테스트 후 데이터 유지됨');
  });

  afterAll(async () => {
    // 플래그 원복 (다른 테스트에 영향 안 주도록)
    TestAppHelper.setSkipCleanup(false);
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // skipCleanup=true 이므로 실제로는 삭제되지 않음
    await TestAppHelper.resetDatabase();
  });

  it('데이터 유지 테스트', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'keep@example.com',
        password: 'password123',
        name: '유지될 사용자',
      });

    console.log('✅ 생성된 사용자 ID:', response.body.user.id);
    console.log('📝 DB 확인 명령어:');
    console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users WHERE email = \'keep@example.com\';"');
    
    // 테스트 후에도 DB에 데이터가 남아있음!
  });
});
```

**실행**:
```bash
# 데이터 유지 테스트 실행
npm run test:e2e -- register-keep-data

# DB 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"

# 정리
npm run test:e2e:clean
```

### 예제 3: 조건부 데이터 유지

```typescript
describe('디버깅용 테스트', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // ✅ DEBUG 환경 변수가 있으면 데이터 유지
    if (process.env.DEBUG === 'true') {
      TestAppHelper.setSkipCleanup(true);
      console.log('🐛 DEBUG 모드: 데이터 유지');
    }
  });

  afterAll(async () => {
    TestAppHelper.setSkipCleanup(false);
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    await TestAppHelper.resetDatabase();
  });

  it('복잡한 로직 테스트', async () => {
    // 복잡한 테스트 로직
    const result = await performComplexOperation();
    
    // DEBUG=true로 실행하면 이 데이터가 DB에 남음
    expect(result).toBeDefined();
  });
});
```

**실행**:
```bash
# 일반 실행 (데이터 삭제)
npm run test:e2e -- 디버깅용테스트

# 디버그 모드 (데이터 유지)
DEBUG=true npm run test:e2e -- 디버깅용테스트
```

### 예제 4: 강제 DB 초기화

```typescript
describe('대량 데이터 테스트', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  it('테스트 시작 전 DB 완전 초기화', async () => {
    // ✅ 테스트 시작 전에 DB를 깨끗하게 만듦
    await TestAppHelper.forceResetDatabase();
    
    // 이제 ID가 1부터 시작
    const user1 = await createUser('user1@example.com');
    expect(user1.id).toBe(1);

    const user2 = await createUser('user2@example.com');
    expect(user2.id).toBe(2);
  });

  it('테스트 중간에 DB 초기화', async () => {
    // 데이터 생성
    await createUser('before@example.com');
    await createUser('before2@example.com');

    // ✅ 중간에 강제 삭제 (플래그 무시)
    await TestAppHelper.forceResetDatabase();

    // 다시 생성 (ID가 1부터 시작)
    const newUser = await createUser('after@example.com');
    expect(newUser.id).toBe(1);
  });
});
```

### 예제 5: 성능 테스트 (데이터 유지)

```typescript
describe('성능 테스트', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true);
  });

  afterAll(async () => {
    TestAppHelper.setSkipCleanup(false);
    
    // 원한다면 테스트 완료 후 정리
    // await TestAppHelper.forceResetDatabase();
    
    await TestAppHelper.cleanup();
  });

  it('10000개의 일정 생성 성능 측정', async () => {
    console.log('⏱️  성능 테스트 시작...');
    
    const startTime = Date.now();
    
    for (let i = 0; i < 10000; i++) {
      await request(app.getHttpServer())
        .post('/api/schedules')
        .send({
          title: `일정 ${i}`,
          startTime: new Date(),
          endTime: new Date(),
        });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 10000개 생성 완료: ${duration}ms`);
    console.log(`📊 평균: ${(duration / 10000).toFixed(2)}ms per schedule`);
    console.log(`💾 데이터가 DB에 유지됨 - pgAdmin으로 확인 가능`);
    
    expect(duration).toBeLessThan(60000); // 60초 이내
  });
});
```

**실행**:
```bash
# 성능 테스트 실행 (데이터 유지)
npm run test:e2e -- 성능테스트

# pgAdmin이나 CLI로 데이터 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT COUNT(*) FROM schedules;"

# 분석 완료 후 정리
npm run test:e2e:clean
```

## 🎨 실전 시나리오

### 시나리오 1: 버그 재현 및 디버깅

```bash
# 1. 버그가 발생한 테스트를 데이터 유지 모드로 실행
KEEP_TEST_DATA=true npm run test:e2e -- 버그테스트

# 2. 테스트 실패 시 DB 상태 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test

# 3. 문제 확인
workwork_test=# SELECT * FROM users WHERE id = 123;
workwork_test=# SELECT * FROM workspaces WHERE id = 45;

# 4. 코드 수정 후 다시 테스트
npm run test:e2e -- 버그테스트

# 5. 정리
npm run test:e2e:clean
```

### 시나리오 2: 새 기능 개발

```typescript
// 1. 새 기능 테스트 작성
describe('새 기능 (E2E)', () => {
  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // 개발 중에는 데이터 유지
    if (process.env.NODE_ENV === 'development') {
      TestAppHelper.setSkipCleanup(true);
    }
  });

  it('새 기능 테스트', async () => {
    // 테스트 코드
  });
});
```

```bash
# 2. 개발하면서 반복 실행 (데이터 확인)
NODE_ENV=development npm run test:e2e -- 새기능

# 3. DB에서 결과 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT * FROM new_feature_table;"

# 4. 완료 후 최종 테스트 (자동 삭제)
npm run test:e2e -- 새기능

# 5. 정리
npm run test:e2e:clean
```

### 시나리오 3: 데이터 마이그레이션 테스트

```typescript
describe('데이터 마이그레이션', () => {
  it('기존 데이터 마이그레이션', async () => {
    // 1. 기존 데이터 생성
    await createOldFormatData();
    
    // 2. 마이그레이션 실행
    await runMigration();
    
    // 3. 결과 확인
    const migratedData = await getNewFormatData();
    expect(migratedData).toBeDefined();
    
    // 4. DB 상태 유지하여 수동 검증
    TestAppHelper.setSkipCleanup(true);
  });
});
```

### 시나리오 4: 통합 테스트

```typescript
describe('전체 플로우 통합 테스트', () => {
  let createdData = {
    userId: null,
    workspaceId: null,
    scheduleIds: [],
  };

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    // 전체 플로우 확인을 위해 데이터 유지
    TestAppHelper.setSkipCleanup(true);
  });

  afterAll(async () => {
    // 통합 테스트 완료 후 정리
    await TestAppHelper.forceResetDatabase();
    TestAppHelper.setSkipCleanup(false);
    await TestAppHelper.cleanup();
  });

  it('1. 회원가입', async () => {
    const response = await registerUser();
    createdData.userId = response.body.user.id;
    createdData.workspaceId = response.body.workspace.id;
  });

  it('2. 일정 생성', async () => {
    for (let i = 0; i < 10; i++) {
      const schedule = await createSchedule(createdData.userId);
      createdData.scheduleIds.push(schedule.id);
    }
  });

  it('3. 알림 발송', async () => {
    await sendNotifications(createdData.scheduleIds);
  });

  it('4. 전체 데이터 검증', async () => {
    // 모든 데이터가 올바르게 연결되어 있는지 확인
    const user = await getUser(createdData.userId);
    const workspace = await getWorkspace(createdData.workspaceId);
    const schedules = await getSchedules(createdData.userId);
    
    expect(user.workspaceId).toBe(workspace.id);
    expect(schedules).toHaveLength(10);
    
    console.log('✅ 통합 테스트 완료 - DB 데이터 확인 가능');
  });
});
```

## 📊 명령어 치트시트

```bash
# === 테스트 실행 ===
npm run test:e2e                              # 기본 (자동 삭제)
npm run test:e2e:keep                         # 데이터 유지
KEEP_TEST_DATA=true npm run test:e2e         # 데이터 유지 (명시적)
DEBUG=true npm run test:e2e -- 테스트파일     # 조건부 유지

# === DB 확인 ===
npm run test:e2e:clean                        # DB 초기화
docker exec workwork-postgres-test psql -U postgres -d workwork_test   # DB 접속

# === 데이터 조회 ===
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT COUNT(*) FROM users;"
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users LIMIT 10;"

# === 특정 테스트만 실행 ===
npm run test:e2e -- register                  # 회원가입 테스트만
npm run test:e2e:keep -- register             # 회원가입 테스트 (데이터 유지)
```

## 💡 팁

1. **로컬 개발**: `KEEP_TEST_DATA=true`로 실행하여 DB 상태 확인
2. **CI/CD**: 환경 변수 없이 실행 (자동 삭제)
3. **디버깅**: 특정 테스트만 `setSkipCleanup(true)` 설정
4. **성능 테스트**: 데이터 유지 후 pgAdmin으로 분석
5. **정리**: 작업 완료 후 `npm run test:e2e:clean`

## ⚠️ 주의사항

1. **CI/CD 환경에서는 KEEP_TEST_DATA 사용 금지**
   ```yaml
   # ❌ 나쁜 예
   - run: KEEP_TEST_DATA=true npm run test:e2e
   
   # ✅ 좋은 예
   - run: npm run test:e2e  # 자동 삭제
   ```

2. **플래그 원복 필수**
   ```typescript
   afterAll(async () => {
     // ✅ 반드시 원복!
     TestAppHelper.setSkipCleanup(false);
   });
   ```

3. **랜덤 데이터 사용**
   ```typescript
   // ✅ 좋은 예
   email: TestDataHelper.randomEmail()
   
   // ❌ 나쁜 예 (데이터 유지 시 충돌)
   email: 'test@example.com'
   ```

---

**핵심**: 
- 개발/디버깅: 데이터 유지 (`KEEP_TEST_DATA=true`)
- 프로덕션/CI: 자동 삭제 (기본값)
- 수동 정리: `npm run test:e2e:clean`

