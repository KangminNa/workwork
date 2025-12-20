# 테스트 가이드

## 📁 테스트 구조

```
server/test/
├── e2e/                          # E2E 테스트 (기능별 분리)
│   ├── auth/
│   │   ├── register.e2e-spec.ts  # 회원가입 테스트
│   │   └── login.e2e-spec.ts     # 로그인 테스트
│   ├── users/                    # 사용자 관리 테스트 (향후 추가)
│   └── schedules/                # 일정 관리 테스트 (향후 추가)
├── helpers/                      # 테스트 헬퍼
│   ├── test-app.helper.ts        # 앱 초기화 공통 헬퍼
│   ├── test-database.helper.ts   # 데이터베이스 헬퍼
│   └── test-data.helper.ts       # 테스트 데이터 생성 헬퍼
├── setup.ts                      # 전역 테스트 설정
├── jest-e2e.json                 # Jest E2E 설정
└── README.md                     # 이 문서
```

## 🎯 테스트 철학

### 1. 기능별 분리
- 각 기능(회원가입, 로그인 등)을 독립적인 파일로 분리
- 테스트 파일 이름은 `{기능명}.e2e-spec.ts` 형식
- 관련 기능끼리 폴더로 그룹화 (예: `auth/`)

### 2. 공통 로직 재사용
- `TestAppHelper`: 앱 초기화, 데이터베이스 초기화 등 공통 설정
- `TestDatabaseHelper`: 데이터베이스 연결, 초기화, 시퀀스 리셋
- `TestDataHelper`: 테스트 데이터 생성 (랜덤 이메일, 사용자, 워크스페이스 등)

### 3. 독립적인 테스트
- 각 테스트는 다른 테스트에 영향을 주지 않음
- `afterEach`에서 데이터베이스 초기화
- 랜덤 데이터 사용으로 충돌 방지

## 🚀 테스트 실행

### 전체 E2E 테스트 실행
```bash
npm run test:e2e
```

### 특정 파일만 테스트
```bash
# 회원가입 테스트만 실행
npm run test:e2e -- register.e2e-spec.ts

# 로그인 테스트만 실행
npm run test:e2e -- login.e2e-spec.ts

# auth 폴더 전체 테스트
npm run test:e2e -- e2e/auth
```

### Watch 모드로 테스트
```bash
npm run test:e2e -- --watch
```

### 커버리지 포함 테스트
```bash
npm run test:cov
```

### IDE에서 테스트 실행
VS Code/Cursor에서:
1. 테스트 파일 열기
2. 테스트 함수 위에 나타나는 "Run Test" 클릭
3. 또는 우클릭 → "Run Test" / "Debug Test"

## ✍️ 새로운 테스트 작성

### 1. 새로운 기능 테스트 파일 생성

```typescript
// test/e2e/users/users.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

describe('사용자 관리 (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    await TestAppHelper.resetDatabase();
  });

  describe('GET /api/users/me', () => {
    it('내 정보 조회 성공', async () => {
      // 테스트 코드 작성
    });
  });
});
```

### 2. 테스트 구조 패턴

```typescript
describe('기능명 (E2E)', () => {
  // 앱 초기화
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    await TestAppHelper.resetDatabase();
  });

  describe('API 엔드포인트', () => {
    describe('성공 케이스', () => {
      it('테스트 설명', async () => {
        // Given: 테스트 데이터 준비
        const testData = {
          email: TestDataHelper.randomEmail(),
          // ...
        };

        // When: API 호출
        const response = await request(app.getHttpServer())
          .post('/api/endpoint')
          .send(testData)
          .expect(200);

        // Then: 결과 검증
        expect(response.body).toHaveProperty('expectedProperty');
      });
    });

    describe('실패 케이스', () => {
      it('유효성 검사 실패', async () => {
        // 실패 케이스 테스트
      });
    });
  });
});
```

### 3. 테스트 데이터 생성

```typescript
// 랜덤 이메일 생성
const email = TestDataHelper.randomEmail();

// 랜덤 문자열 생성
const code = TestDataHelper.randomString(6);

// 테스트 사용자 생성 (향후 추가 예정)
const user = await TestDataHelper.createTestUser({
  email: 'test@example.com',
  name: '테스트 유저',
});

// 테스트 워크스페이스 생성 (향후 추가 예정)
const workspace = await TestDataHelper.createTestWorkspace({
  name: '테스트 워크스페이스',
});
```

## 📝 테스트 작성 가이드

### 1. 테스트 이름 작성
- **명확하고 구체적으로**: "성공: Owner로 회원가입"
- **한글 사용 가능**: 가독성을 위해 한글 권장
- **Given-When-Then 패턴**: 상황-행동-결과를 명확히

### 2. 테스트 케이스 분류
```typescript
describe('API 엔드포인트', () => {
  describe('성공 케이스', () => {
    // 정상 동작 테스트
  });

  describe('실패 케이스 - 유효성 검사', () => {
    // DTO 유효성 검사 실패 테스트
  });

  describe('실패 케이스 - 비즈니스 로직', () => {
    // 비즈니스 로직 실패 테스트
  });
});
```

### 3. Assertion 작성
```typescript
// 응답 구조 검증
expect(response.body).toHaveProperty('user');
expect(response.body).toHaveProperty('accessToken');

// 값 검증
expect(response.body.user.email).toBe(registerDto.email);
expect(response.body.user.role).toBe('owner');

// 배열/객체 검증
expect(response.body.users).toHaveLength(3);
expect(response.body.workspace).toMatchObject({
  name: '테스트 워크스페이스',
});

// 정규식 검증
expect(response.body.inviteCode).toMatch(/^WORK-[A-Z0-9]{6}$/);

// 에러 메시지 검증
expect(response.body.message).toBe('이미 사용중인 이메일입니다');
expect(response.body.message).toContain('이메일');
```

### 4. 인증이 필요한 API 테스트
```typescript
it('인증된 사용자만 접근 가능', async () => {
  // 1. 회원가입/로그인으로 토큰 획득
  const registerResponse = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      email: TestDataHelper.randomEmail(),
      password: 'password123',
      name: '테스트',
    });

  const token = registerResponse.body.accessToken;

  // 2. 토큰과 함께 API 호출
  const response = await request(app.getHttpServer())
    .get('/api/users/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  expect(response.body.email).toBeDefined();
});
```

## 🔧 헬퍼 함수 사용

### TestAppHelper
```typescript
// 앱 초기화
const app = await TestAppHelper.initialize();

// 앱 종료
await TestAppHelper.cleanup();

// 데이터베이스 초기화
await TestAppHelper.resetDatabase();

// ConfigService 가져오기
const config = TestAppHelper.getConfigService();
```

### TestDatabaseHelper
```typescript
// 데이터베이스 연결
await TestDatabaseHelper.connect(configService);

// 데이터베이스 초기화
await TestDatabaseHelper.cleanDatabase();

// 시퀀스 리셋
await TestDatabaseHelper.resetSequences();

// 연결 해제
await TestDatabaseHelper.disconnect();
```

### TestDataHelper
```typescript
// 랜덤 이메일
const email = TestDataHelper.randomEmail();
// 예: test-abc123@example.com

// 랜덤 문자열
const str = TestDataHelper.randomString(10);
// 예: xk2p9mq7n4
```

## 🎨 VS Code 스니펫

`.vscode/snippets.code-snippets`에 유용한 스니펫이 정의되어 있습니다:

- `e2e-test`: E2E 테스트 파일 템플릿
- `e2e-describe`: describe 블록
- `e2e-it`: it 테스트 케이스
- `e2e-auth-test`: 인증 필요한 테스트

사용법: 파일에서 `e2e-test` 입력 후 Tab 키

## 📊 테스트 커버리지

```bash
# 커버리지 리포트 생성
npm run test:cov

# 커버리지 HTML 리포트 보기
open coverage/index.html
```

## 🐛 디버깅

### VS Code에서 디버깅
1. 테스트 파일 열기
2. 브레이크포인트 설정
3. 테스트 위에서 "Debug Test" 클릭
4. 또는 F5 → "Jest E2E Tests" 선택

### 로그 출력
```typescript
it('디버깅 테스트', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send(registerDto);

  // 응답 전체 출력
  console.log('Response:', JSON.stringify(response.body, null, 2));

  // 특정 값 출력
  console.log('User ID:', response.body.user.id);
});
```

## 📚 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Supertest 문서](https://github.com/visionmedia/supertest)
- [NestJS Testing 가이드](https://docs.nestjs.com/fundamentals/testing)

## 💡 팁

1. **테스트 격리**: 각 테스트는 독립적으로 실행 가능해야 함
2. **랜덤 데이터 사용**: 이메일 등은 `TestDataHelper.randomEmail()` 사용
3. **명확한 에러 메시지**: 실제 코드의 에러 메시지와 정확히 일치시키기
4. **Given-When-Then**: 테스트 코드에 주석으로 명시하면 가독성 향상
5. **작은 단위로 테스트**: 하나의 테스트는 하나의 기능만 검증
6. **실패 케이스도 중요**: 성공 케이스만큼 실패 케이스도 꼼꼼히 작성

## 🔄 향후 추가 예정

- [ ] Unit 테스트 가이드
- [ ] Integration 테스트 가이드
- [ ] Mock 사용 가이드
- [ ] 성능 테스트 가이드
- [ ] CI/CD 통합 가이드

