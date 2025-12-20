# 🗑️ 테스트 DB 삭제 플래그 가이드

## 📌 개요

테스트 실행 후 DB 데이터를 **유지**하거나 **삭제**할 수 있는 플래그를 제공합니다.

## 🎯 사용 방법

### 방법 1: 환경 변수로 전역 제어

#### 데이터 유지 (모든 테스트)
```bash
# E2E 테스트 실행 후 DB 데이터 유지
KEEP_TEST_DATA=true npm run test:e2e

# 또는 간편 명령어
npm run test:e2e:keep
```

#### 데이터 삭제 (기본값)
```bash
# 일반적인 테스트 실행 (afterEach에서 자동 삭제)
npm run test:e2e
```

### 방법 2: 코드에서 개별 제어

#### 특정 테스트에서만 데이터 유지
```typescript
describe('테스트명', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // ✅ 이 테스트에서만 DB 삭제 생략
    TestAppHelper.setSkipCleanup(true);
  });

  afterAll(async () => {
    // 플래그 원복
    TestAppHelper.setSkipCleanup(false);
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // skipCleanup=true 이므로 삭제되지 않음
    await TestAppHelper.resetDatabase();
  });

  it('테스트', async () => {
    // 테스트 코드
    // 이 테스트 후 DB 데이터가 유지됨!
  });
});
```

#### 특정 테스트에서 강제 삭제
```typescript
it('테스트 중간에 DB 초기화', async () => {
  // 데이터 생성
  await createSomeData();

  // 플래그 무시하고 강제 삭제
  await TestAppHelper.forceResetDatabase();

  // 새 데이터 생성 (ID가 1부터 시작)
  await createNewData();
});
```

### 방법 3: 수동으로 DB 정리

```bash
# 테스트 DB 모든 데이터 삭제
npm run test:e2e:clean

# 또는 직접 실행
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "TRUNCATE TABLE users, workspaces CASCADE;"
```

## 📂 예제 파일

### 1. 데이터 유지 예제
파일: `test/e2e/auth/register-keep-data.e2e-spec.ts`

```typescript
describe('회원가입 - DB 데이터 유지 (E2E)', () => {
  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true); // ✅ 삭제 안 함
  });

  afterAll(async () => {
    TestAppHelper.setSkipCleanup(false); // 플래그 원복
    await TestAppHelper.cleanup();
  });

  it('테스트', async () => {
    // 테스트 후 데이터가 DB에 남음
  });
});
```

**실행**:
```bash
# 이 파일만 실행
npm run test:e2e -- register-keep-data

# 실행 후 DB 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"
```

### 2. 강제 삭제 예제
파일: `test/e2e/auth/register-force-cleanup.e2e-spec.ts`

```typescript
it('테스트 중간에 강제 DB 초기화', async () => {
  // 데이터 생성
  const user1 = await createUser();
  console.log('User ID:', user1.id); // 예: 10

  // 강제 삭제 (플래그 무시)
  await TestAppHelper.forceResetDatabase();

  // 다시 생성 (ID가 1부터 시작)
  const user2 = await createUser();
  console.log('User ID:', user2.id); // 1

  expect(user2.id).toBe(1);
});
```

## 🔧 API 설명

### TestAppHelper 메서드

#### `setSkipCleanup(skip: boolean)`
```typescript
// DB 삭제 생략 설정
TestAppHelper.setSkipCleanup(true);  // 삭제 안 함
TestAppHelper.setSkipCleanup(false); // 삭제 함 (기본값)
```

#### `shouldKeepData(): boolean`
```typescript
// 현재 데이터 유지 여부 확인
if (TestAppHelper.shouldKeepData()) {
  console.log('데이터가 유지됩니다');
}
```

#### `resetDatabase()`
```typescript
// 일반 삭제 (플래그 영향 받음)
await TestAppHelper.resetDatabase();

// KEEP_TEST_DATA=true 이면 삭제 안 함
// skipCleanup=true 이면 삭제 안 함
```

#### `forceResetDatabase()`
```typescript
// 강제 삭제 (플래그 무시)
await TestAppHelper.forceResetDatabase();

// 항상 삭제됨 (플래그와 무관)
```

## 📊 플래그 우선순위

```
1. forceResetDatabase() 호출
   → 무조건 삭제 ✅

2. KEEP_TEST_DATA=true 환경 변수
   → 삭제 안 함 ❌

3. TestAppHelper.setSkipCleanup(true)
   → 삭제 안 함 ❌

4. 기본값
   → 삭제 함 ✅
```

## 🎨 사용 시나리오

### 시나리오 1: 디버깅을 위해 데이터 확인
```bash
# 1. 테스트 실행 (데이터 유지)
KEEP_TEST_DATA=true npm run test:e2e

# 2. DB 데이터 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test
SELECT * FROM users;
SELECT * FROM workspaces;

# 3. 확인 후 정리
npm run test:e2e:clean
```

### 시나리오 2: 특정 테스트만 데이터 유지
```typescript
describe('디버깅할 테스트', () => {
  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    
    // 이 테스트만 데이터 유지
    if (process.env.DEBUG === 'true') {
      TestAppHelper.setSkipCleanup(true);
    }
  });
});
```

```bash
# 디버그 모드로 실행
DEBUG=true npm run test:e2e -- 특정테스트파일
```

### 시나리오 3: 대량 데이터 생성 후 확인
```typescript
it('1000명의 사용자 생성', async () => {
  // 데이터 생성 전에 삭제
  await TestAppHelper.forceResetDatabase();

  // 1000명 생성
  for (let i = 0; i < 1000; i++) {
    await createUser(`user${i}@example.com`);
  }

  // 이 테스트 후에는 삭제하지 않음 (수동 확인용)
  TestAppHelper.setSkipCleanup(true);
});
```

## 🚨 주의사항

### 1. 데이터 충돌 방지
```typescript
// ❌ 나쁜 예: 고정된 이메일 사용 + 데이터 유지
TestAppHelper.setSkipCleanup(true);
await createUser('test@example.com'); // 다음 실행 시 충돌!

// ✅ 좋은 예: 랜덤 이메일 사용
TestAppHelper.setSkipCleanup(true);
await createUser(TestDataHelper.randomEmail()); // 충돌 없음
```

### 2. 플래그 원복
```typescript
describe('테스트', () => {
  afterAll(async () => {
    // ✅ 반드시 플래그 원복!
    TestAppHelper.setSkipCleanup(false);
    await TestAppHelper.cleanup();
  });
});
```

### 3. CI/CD 환경
```yaml
# GitHub Actions 예시
- name: Run E2E Tests
  run: npm run test:e2e  # KEEP_TEST_DATA 없음 (자동 삭제)
```

## 📝 실전 예제

### 예제 1: 새 기능 개발 시
```bash
# 1. 데이터 유지하면서 테스트
KEEP_TEST_DATA=true npm run test:e2e -- my-new-feature

# 2. DB 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT * FROM my_new_table;"

# 3. 문제 없으면 정리
npm run test:e2e:clean
```

### 예제 2: 성능 테스트
```typescript
describe('성능 테스트', () => {
  beforeAll(async () => {
    TestAppHelper.setSkipCleanup(true);
  });

  it('10000개의 일정 생성', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 10000; i++) {
      await createSchedule();
    }
    
    const endTime = Date.now();
    console.log(`소요 시간: ${endTime - startTime}ms`);
    
    // 데이터가 DB에 남아있어 pgAdmin 등으로 확인 가능
  });
});
```

## 🔍 DB 데이터 확인 명령어

```bash
# 사용자 수 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT COUNT(*) FROM users;"

# 최근 생성된 사용자 10명
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10;"

# 워크스페이스별 사용자 수
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT w.name, COUNT(u.id) as user_count FROM workspaces w LEFT JOIN users u ON w.id = u.workspace_id GROUP BY w.id, w.name;"

# 모든 데이터 삭제
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "TRUNCATE TABLE users, workspaces CASCADE;"
```

## 📚 관련 문서

- `TEST_SUMMARY.md` - 전체 테스트 구조
- `TEST_DB_VERIFICATION.md` - DB 데이터 검증 방법
- `test/README.md` - 테스트 작성 가이드

## 💡 팁

1. **로컬 개발**: `KEEP_TEST_DATA=true`로 실행하여 DB 상태 확인
2. **CI/CD**: 항상 자동 삭제 (기본값)
3. **디버깅**: `forceResetDatabase()`로 특정 시점 초기화
4. **성능 테스트**: 데이터 유지하여 pgAdmin으로 분석
5. **정리**: `npm run test:e2e:clean`으로 한 번에 정리

---

**핵심 요약**:
- ✅ `KEEP_TEST_DATA=true`: 모든 테스트에서 데이터 유지
- ✅ `TestAppHelper.setSkipCleanup(true)`: 특정 테스트에서만 유지
- ✅ `TestAppHelper.forceResetDatabase()`: 플래그 무시하고 강제 삭제
- ✅ `npm run test:e2e:clean`: 수동으로 DB 정리

