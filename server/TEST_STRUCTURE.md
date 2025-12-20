# 📁 테스트 구조 가이드

## 🎯 개요

WorkWork 프로젝트의 테스트는 **기능별로 분리**되어 있으며, **공통 헬퍼**를 통해 재사용성을 높였습니다.

## 📂 현재 테스트 구조

```
server/test/
├── 📁 e2e/                          # E2E 테스트 (기능별 분리)
│   └── 📁 auth/                     # 인증 관련 테스트
│       ├── 📄 register.e2e-spec.ts  # ✅ 회원가입 (14개 테스트)
│       └── 📄 login.e2e-spec.ts     # ✅ 로그인 (7개 테스트)
│
├── 📁 helpers/                      # 테스트 헬퍼 유틸리티
│   ├── 📄 test-app.helper.ts        # 앱 초기화 공통 헬퍼
│   ├── 📄 test-database.helper.ts   # 데이터베이스 헬퍼
│   └── 📄 test-data.helper.ts       # 테스트 데이터 생성 헬퍼
│
├── 📄 setup.ts                      # 전역 테스트 설정
├── 📄 jest-e2e.json                 # Jest E2E 설정
└── 📄 README.md                     # 테스트 작성 가이드
```

## 🧪 테스트 현황

### ✅ 구현 완료 (21개 테스트)

#### 1. 회원가입 테스트 (`register.e2e-spec.ts`) - 14개
**초대 코드 없이 회원가입 (7개)**
- ✅ Owner로 회원가입 성공
- ✅ 다른 사용자가 새로운 워크스페이스로 회원가입 성공
- ✅ 이메일 형식 오류
- ✅ 비밀번호 너무 짧음 (6자 미만)
- ✅ 이름 누락
- ✅ 이메일 누락
- ✅ 이메일 중복

**초대 코드로 회원가입 (7개)**
- ✅ Member로 회원가입 성공
- ✅ 여러 명의 Member가 같은 워크스페이스에 가입 성공
- ✅ 유효하지 않은 초대 코드 형식
- ✅ 존재하지 않는 초대 코드
- ✅ 초대 코드로 가입 시 이메일 중복

#### 2. 로그인 테스트 (`login.e2e-spec.ts`) - 7개
**성공 케이스 (3개)**
- ✅ 로그인 성공 (Owner)
- ✅ 로그인 성공 (Member)
- ✅ 같은 사용자가 여러 번 로그인 성공

**실패 케이스 - 유효성 검사 (3개)**
- ✅ 이메일 형식 오류
- ✅ 이메일 누락
- ✅ 비밀번호 누락

**실패 케이스 - 인증 오류 (3개)**
- ✅ 존재하지 않는 이메일
- ✅ 잘못된 비밀번호
- ✅ 비밀번호 대소문자 구분

## 🔮 향후 추가 예정 구조

```
server/test/
├── 📁 e2e/
│   ├── 📁 auth/                     # ✅ 완료
│   │   ├── register.e2e-spec.ts
│   │   └── login.e2e-spec.ts
│   │
│   ├── 📁 users/                    # 🔜 예정: 사용자 관리
│   │   ├── profile.e2e-spec.ts     # 프로필 조회/수정
│   │   ├── workspace.e2e-spec.ts   # 워크스페이스 멤버 관리
│   │   └── settings.e2e-spec.ts    # 사용자 설정
│   │
│   ├── 📁 schedules/                # 🔜 예정: 일정 관리
│   │   ├── create.e2e-spec.ts      # 일정 생성
│   │   ├── read.e2e-spec.ts        # 일정 조회
│   │   ├── update.e2e-spec.ts      # 일정 수정
│   │   ├── delete.e2e-spec.ts      # 일정 삭제
│   │   └── visibility.e2e-spec.ts  # 일정 공개 범위
│   │
│   └── 📁 notifications/            # 🔜 예정: 알림
│       ├── send.e2e-spec.ts        # 알림 발송
│       ├── receive.e2e-spec.ts     # 알림 수신
│       └── websocket.e2e-spec.ts   # WebSocket 연결
│
├── 📁 unit/                         # 🔜 예정: 단위 테스트
│   ├── 📁 services/
│   ├── 📁 repositories/
│   └── 📁 utils/
│
└── 📁 integration/                  # 🔜 예정: 통합 테스트
    ├── 📁 database/
    └── 📁 external-apis/
```

## 🏗️ 테스트 아키텍처

### 1. 공통 헬퍼 (`helpers/`)

#### `TestAppHelper`
- **역할**: NestJS 앱 초기화 및 관리
- **주요 메서드**:
  - `initialize()`: 앱 초기화, ValidationPipe 설정, DB 연결
  - `cleanup()`: 앱 종료 및 리소스 정리
  - `resetDatabase()`: 각 테스트 후 DB 초기화
  - `getApp()`: 앱 인스턴스 반환
  - `getConfigService()`: ConfigService 반환

#### `TestDatabaseHelper`
- **역할**: 데이터베이스 연결 및 초기화
- **주요 메서드**:
  - `connect()`: DB 연결
  - `disconnect()`: DB 연결 해제
  - `cleanDatabase()`: 모든 테이블 데이터 삭제
  - `resetSequences()`: ID 시퀀스 초기화

#### `TestDataHelper`
- **역할**: 테스트 데이터 생성
- **주요 메서드**:
  - `randomEmail()`: 랜덤 이메일 생성
  - `randomString()`: 랜덤 문자열 생성
  - (향후) `createTestUser()`: 테스트 사용자 생성
  - (향후) `createTestWorkspace()`: 테스트 워크스페이스 생성

### 2. 테스트 파일 구조 패턴

```typescript
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppHelper } from '../../helpers/test-app.helper';
import { TestDataHelper } from '../../helpers/test-data.helper';

describe('기능명 (E2E)', () => {
  let app: INestApplication;

  // 테스트 스위트 시작 전 1회 실행
  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  // 테스트 스위트 종료 후 1회 실행
  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  // 각 테스트 후 실행 (DB 초기화)
  afterEach(async () => {
    await TestAppHelper.resetDatabase();
  });

  describe('API 엔드포인트', () => {
    describe('성공 케이스', () => {
      it('테스트 설명', async () => {
        // Given: 테스트 데이터 준비
        const testData = { /* ... */ };

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
      it('에러 케이스', async () => {
        // 실패 케이스 테스트
      });
    });
  });
});
```

## 🎯 테스트 작성 원칙

### 1. 기능별 분리
- ✅ 각 기능을 독립적인 파일로 분리
- ✅ 관련 기능끼리 폴더로 그룹화
- ✅ 파일명: `{기능명}.e2e-spec.ts`

### 2. 독립성 보장
- ✅ 각 테스트는 다른 테스트에 영향을 주지 않음
- ✅ `afterEach`에서 DB 초기화
- ✅ 랜덤 데이터 사용으로 충돌 방지

### 3. 재사용성
- ✅ 공통 로직은 헬퍼로 추출
- ✅ 테스트 데이터 생성 함수 활용
- ✅ 중복 코드 최소화

### 4. 가독성
- ✅ 명확한 테스트 이름 (한글 사용)
- ✅ Given-When-Then 패턴
- ✅ describe 블록으로 계층 구조화

## 📊 테스트 실행 결과

```bash
$ npm run test:e2e

PASS test/e2e/auth/login.e2e-spec.ts
PASS test/e2e/auth/register.e2e-spec.ts

Test Suites: 2 passed, 2 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        3.561 s
```

## 🚀 다음 단계

### 1. 사용자 관리 테스트 (`users/`)
- [ ] 프로필 조회/수정
- [ ] 워크스페이스 멤버 목록 조회
- [ ] 멤버 권한 관리
- [ ] 사용자 설정

### 2. 일정 관리 테스트 (`schedules/`)
- [ ] 일정 생성 (1시간 단위)
- [ ] 일정 조회 (개인/팀)
- [ ] 일정 수정
- [ ] 일정 삭제
- [ ] 일정 공개 범위 설정

### 3. 알림 테스트 (`notifications/`)
- [ ] 알림 발송
- [ ] 알림 수신
- [ ] WebSocket 연결
- [ ] 알림 설정 관리

### 4. 단위 테스트 (`unit/`)
- [ ] Service 레이어 테스트
- [ ] Repository 레이어 테스트
- [ ] Util 함수 테스트

## 📚 참고 문서

- [테스트 작성 가이드](./README.md)
- [서버 구조 문서](../README.md)
- [Docker 설정 가이드](../../DOCKER_SETUP.md)
- [전체 테스트 가이드](../../TESTING_GUIDE.md)

## 💡 팁

1. **새로운 기능 추가 시**:
   - `test/e2e/{기능명}/` 폴더 생성
   - 기능별로 테스트 파일 분리
   - `TestAppHelper` 사용으로 초기화 간소화

2. **테스트 실행**:
   - 전체: `npm run test:e2e`
   - 특정 파일: `npm run test:e2e -- register.e2e-spec.ts`
   - Watch 모드: `npm run test:e2e -- --watch`

3. **IDE 통합**:
   - VS Code에서 테스트 파일 우클릭 → "Run Test"
   - 브레이크포인트 설정 후 "Debug Test"

4. **디버깅**:
   - `console.log()`로 응답 확인
   - VS Code 디버거 활용
   - 실패한 테스트만 재실행: `npm run test:e2e -- --onlyFailures`

