# 테스트 가이드

## 📋 테스트 구조

```
server/
├── src/
│   └── modules/
│       └── auth/
│           ├── auth.service.ts
│           └── auth.service.spec.ts      ← 유닛 테스트
├── test/
│   ├── auth.e2e-spec.ts                   ← E2E 테스트
│   ├── jest-e2e.json                      ← E2E 설정
│   ├── setup.ts                           ← 테스트 환경 설정
│   └── helpers/
│       ├── test-database.helper.ts        ← DB 헬퍼
│       └── test-data.helper.ts            ← 테스트 데이터 생성
```

## 🧪 테스트 종류

### 1. 유닛 테스트 (Unit Tests)
- **목적**: 개별 함수/클래스 단위 테스트
- **위치**: `src/**/*.spec.ts`
- **특징**: Mock을 사용하여 의존성 격리

### 2. E2E 테스트 (End-to-End Tests)
- **목적**: 전체 API 플로우 테스트
- **위치**: `test/**/*.e2e-spec.ts`
- **특징**: 실제 데이터베이스 사용

## 🚀 테스트 실행

### 전체 테스트

```bash
# 유닛 테스트만
cd server && npm run test

# E2E 테스트만
cd server && npm run test:e2e

# 전체 테스트 (유닛 + E2E)
cd server && npm run test && npm run test:e2e
```

### Watch 모드 (개발 중)

```bash
# 파일 변경 시 자동 재실행
cd server && npm run test:watch
```

### 커버리지 확인

```bash
cd server && npm run test:cov

# 커버리지 리포트: coverage/lcov-report/index.html
```

### Makefile 사용

```bash
# 전체 테스트
make test

# Watch 모드
make test-watch

# 커버리지
make test-cov

# E2E 테스트
make test-e2e
```

## ⚙️ 테스트 환경 설정

### 1. Docker 데이터베이스 실행

E2E 테스트는 실제 데이터베이스가 필요합니다:

```bash
# Docker 컨테이너 시작
docker-compose up -d postgres-test

# 또는 전체 실행
make docker-up
```

### 2. 환경 변수 설정

테스트용 환경 변수는 `test/.env.test`에 자동 설정되어 있습니다:

```env
NODE_ENV=test
PORT=4001
DB_HOST=localhost
DB_PORT=5433          # 테스트 DB는 5433 포트
DB_DATABASE=workwork_test
```

## 📝 테스트 작성 가이드

### 유닛 테스트 예시

```typescript
// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('성공: 회원가입', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue({ id: 1 } as any);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(userRepository.save).toHaveBeenCalled();
    });
  });
});
```

### E2E 테스트 예시

```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabaseHelper } from './helpers/test-database.helper';

describe('AuthController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await TestDatabaseHelper.connect(configService);
    await app.init();
  });

  afterAll(async () => {
    await TestDatabaseHelper.disconnect();
    await app.close();
  });

  afterEach(async () => {
    await TestDatabaseHelper.cleanDatabase();
  });

  it('/api/auth/register (POST)', async () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerDto)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
  });
});
```

## 🔧 테스트 헬퍼 사용

### 데이터베이스 헬퍼

```typescript
import { TestDatabaseHelper } from './helpers/test-database.helper';

// 연결
await TestDatabaseHelper.connect(configService);

// 데이터 초기화 (각 테스트 후)
await TestDatabaseHelper.cleanDatabase();

// ID 시퀀스 리셋
await TestDatabaseHelper.resetSequences();

// 연결 해제
await TestDatabaseHelper.disconnect();
```

### 테스트 데이터 생성

```typescript
import { TestDataHelper } from './helpers/test-data.helper';

// 워크스페이스 생성
const workspace = TestDataHelper.createWorkspace({
  name: 'Custom Workspace',
});

// 사용자 생성
const user = await TestDataHelper.createUser({
  email: 'custom@example.com',
});

// Owner 사용자 생성
const owner = await TestDataHelper.createOwnerUser();

// 랜덤 이메일
const email = TestDataHelper.randomEmail();

// 랜덤 초대 코드
const inviteCode = TestDataHelper.randomInviteCode();
```

## 📊 테스트 결과 예시

### 성공 케이스

```
PASS  src/modules/auth/auth.service.spec.ts
  AuthService
    ✓ should be defined (3 ms)
    register
      초대 코드 없이 회원가입
        ✓ 성공: Owner로 회원가입 (12 ms)
        ✓ 실패: 이메일 중복 (8 ms)
      초대 코드로 회원가입
        ✓ 성공: Member로 회원가입 (10 ms)
        ✓ 실패: 유효하지 않은 초대 코드 (5 ms)
    login
      ✓ 성공: 로그인 (15 ms)
      ✓ 실패: 잘못된 비밀번호 (12 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Time:        2.345 s
```

## 🎯 테스트 커버리지 목표

| 항목 | 목표 |
|------|------|
| **Statements** | 80% 이상 |
| **Branches** | 75% 이상 |
| **Functions** | 80% 이상 |
| **Lines** | 80% 이상 |

## 🐛 디버깅

### Jest 디버깅

```bash
# VS Code에서 디버깅
npm run test:debug

# Chrome DevTools 사용
node --inspect-brk node_modules/.bin/jest --runInBand
```

### VS Code 디버그 설정

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/server/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📚 베스트 프랙티스

### ✅ 좋은 테스트

1. **명확한 테스트 이름**
   ```typescript
   it('성공: 초대 코드로 Member 회원가입', async () => {
     // ...
   });
   ```

2. **Given-When-Then 패턴**
   ```typescript
   it('실패: 이메일 중복', async () => {
     // Given: 이미 가입된 사용자
     await createUser({ email: 'test@example.com' });
     
     // When: 같은 이메일로 재가입 시도
     const result = service.register({ email: 'test@example.com' });
     
     // Then: 에러 발생
     await expect(result).rejects.toThrow(ConflictException);
   });
   ```

3. **독립적인 테스트**
   - 각 테스트는 다른 테스트에 의존하지 않음
   - `afterEach`에서 데이터 초기화

4. **Mock 최소화 (E2E)**
   - E2E에서는 실제 DB 사용
   - 외부 API만 Mock

### ❌ 피해야 할 것

1. **테스트 간 의존성**
   ```typescript
   // ❌ 나쁜 예
   it('test 1', () => { globalVar = 'value'; });
   it('test 2', () => { expect(globalVar).toBe('value'); });
   ```

2. **너무 많은 것을 테스트**
   ```typescript
   // ❌ 나쁜 예: 한 테스트에서 너무 많은 것을 검증
   it('전체 플로우', () => {
     // 회원가입, 로그인, Todo 생성, 알림...
   });
   ```

3. **구현 세부사항 테스트**
   ```typescript
   // ❌ 나쁜 예: 내부 구현 테스트
   expect(service.privateMethod).toHaveBeenCalled();
   
   // ✅ 좋은 예: 결과 테스트
   expect(result.user.email).toBe('test@example.com');
   ```

## 🔄 CI/CD 통합

### GitHub Actions 예시

`.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: workwork_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run test:cov
```

## 📞 문의

테스트 관련 문의사항은 이슈를 등록해주세요.

