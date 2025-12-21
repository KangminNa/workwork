# WorkWork Server

초대 코드 기반 팀 일정 관리 서비스 백엔드 (NestJS + TypeScript + PostgreSQL)

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. DB 실행 (Docker)
make docker-up

# 3. 개발 서버 실행
npm run dev

# 4. 테스트 실행
npm run test
npm run test:e2e
```

## 📁 프로젝트 구조

```
server/
├── src/
│   ├── database/base/          # 불변 ORM 레이어
│   ├── modules/
│   │   ├── auth/              # 회원가입/로그인
│   │   ├── users/             # 사용자 관리
│   │   └── workspaces/        # 워크스페이스 관리
│   └── common/utils/          # 공통 유틸리티
└── test/
    ├── e2e/                   # E2E 테스트
    ├── unit/                  # 유닛 테스트
    └── helpers/               # 테스트 헬퍼
```

## 🎯 핵심 기능

### 1. 회원가입 (Register)
- **초대 코드 없이**: 새 워크스페이스 생성 + Owner 권한
- **초대 코드 있으면**: 기존 워크스페이스 참여 + Member 권한

```typescript
// POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "inviteCode": "WORK-ABC123"  // 선택사항
}
```

### 2. 로그인 (Login)

```typescript
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 응답 형식

```typescript
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "owner" | "member"
  },
  "workspace": {
    "id": 1,
    "name": "홍길동's Workspace",
    "inviteCode": "WORK-ABC123"
  },
  "accessToken": "eyJhbGc..."
}
```

## 🏗️ 아키텍처 설계

### 불변 ORM 레이어

비즈니스가 변해도 **기본 CRUD는 절대 변하지 않음**을 보장

```typescript
// BaseRepository - 불변 계층
interface IBaseRepository<T> {
  save(entity: T): Promise<T>;
  delete(id: number): Promise<boolean>;
  update(id: number, data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
}

// UserRepository - 비즈니스 계층 (변경 가능)
class UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  findByWorkspace(workspaceId: number): Promise<User[]>;
}
```

### 엔티티 구조

```typescript
// User Entity
{
  id: number;
  email: string;        // unique
  password: string;     // bcrypt hash
  name: string;
  role: 'owner' | 'member';
  workspaceId: number;
}

// Workspace Entity
{
  id: number;
  name: string;
  inviteCode: string;   // unique, format: WORK-XXXXXX
  ownerId: number;
}
```

## 🧪 테스트

### 테스트 구조
```
test/
├── e2e/
│   └── auth/
│       ├── register.e2e-spec.ts  # 회원가입 E2E
│       └── login.e2e-spec.ts     # 로그인 E2E
├── unit/
│   ├── services/
│   │   └── auth.service.spec.ts  # AuthService 유닛
│   └── repositories/
│       ├── base.repository.spec.ts
│       ├── user.repository.spec.ts
│       └── workspace.repository.spec.ts
└── helpers/                       # 테스트 헬퍼
```

### 테스트 실행

```bash
# 유닛 테스트
npm run test:unit
npm run test:unit:watch

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:cov

# IDE에서 실행 (VS Code/Cursor)
# 테스트 파일 우클릭 → "Run Test" / "Debug Test"
```

### 테스트 특징
- ✅ **완전 격리**: 각 테스트마다 DB 초기화
- ✅ **실제 DB 사용**: 테스트 전용 PostgreSQL (포트 5433)
- ✅ **자동 정리**: afterEach에서 DB 데이터 삭제 + 시퀀스 초기화

## 🐳 Docker 환경

```yaml
# docker-compose.yml
services:
  postgres:         # 개발 DB (포트 5432)
  postgres_test:    # 테스트 DB (포트 5433)
  redis:            # Redis (포트 6379)
```

### Docker 명령어

```bash
make docker-up        # 컨테이너 시작
make docker-down      # 컨테이너 중지
make docker-clean     # 볼륨 포함 삭제
make docker-logs      # 로그 확인
make db-connect       # 개발 DB 접속
make db-test-connect  # 테스트 DB 접속
```

## 🔧 환경 변수

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=workwork

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=3600s

# 테스트 DB는 포트 5433 사용
```

## 📚 주요 명령어

```bash
# 개발
npm run dev                # 개발 서버 (watch 모드)
npm run build              # 프로덕션 빌드
npm run start:prod         # 프로덕션 실행

# 테스트
npm run test               # 전체 테스트
npm run test:unit          # 유닛 테스트
npm run test:e2e           # E2E 테스트
npm run test:cov           # 커버리지

# DB
make db-reset              # 테스트 DB 초기화
make db-connect            # 개발 DB 접속
make db-test-connect       # 테스트 DB 접속

# Docker
make docker-up             # Docker 시작
make docker-down           # Docker 중지
make docker-clean          # Docker 정리
```

## 📖 상세 문서

더 자세한 내용은 [documents](./documents/README.md) 폴더를 참고하세요.

## 🛠️ 기술 스택

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15 + TypeORM 0.3.x
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **Validation**: class-validator + class-transformer
- **Container**: Docker + Docker Compose

## 📝 개발 가이드

### 새 기능 추가 순서

1. **Entity 정의** (`*.entity.ts`)
2. **Repository 작성** (`*.repository.ts` - BaseRepository 상속)
3. **DTO 정의** (`dto/*.dto.ts`)
4. **Service 작성** (`*.service.ts`)
5. **Controller 작성** (`*.controller.ts`)
6. **테스트 작성** (`*.spec.ts`, `*.e2e-spec.ts`)

### 코드 규칙

- **불변 레이어**: `BaseRepository`의 기본 CRUD는 절대 수정 금지
- **비즈니스 레이어**: 각 Repository는 비즈니스 쿼리 메서드 자유롭게 추가
- **트랜잭션**: 최대한 짧게, 빠른 처리 우선
- **테스트**: 모든 기능은 E2E + 유닛 테스트 필수

## 🚨 문제 해결

### DB 연결 실패
```bash
# Docker 컨테이너 재시작
make docker-restart

# DB 초기화
make db-reset
```

### 테스트 실패
```bash
# 테스트 DB 초기화
docker exec workwork-postgres-test psql -U postgres -c "DROP DATABASE IF EXISTS workwork_test;"
docker exec workwork-postgres-test psql -U postgres -c "CREATE DATABASE workwork_test;"

# 다시 실행
npm run test:e2e
```

### 포트 충돌
```bash
# 5432 포트 사용 확인
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

## 📞 문의

추가 문의사항은 프로젝트 이슈 또는 담당자에게 연락하세요.

