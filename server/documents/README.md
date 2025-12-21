# WorkWork Server - 상세 문서

## 📚 목차

1. [아키텍처 상세](#아키텍처-상세)
2. [데이터베이스 스키마](#데이터베이스-스키마)
3. [API 명세](#api-명세)
4. [테스트 가이드](#테스트-가이드)
5. [개발 환경 설정](#개발-환경-설정)

---

## 아키텍처 상세

### 불변 ORM 레이어 철학

비즈니스 요구사항이 변해도 **기본 CRUD 로직은 절대 변하지 않는다**는 원칙:

```typescript
// ✅ 불변 레이어 - 절대 변경 금지
interface IBaseRepository<T> {
  save(entity: T): Promise<T>;
  saveMany(entities: T[]): Promise<T[]>;
  delete(id: number): Promise<boolean>;
  deleteMany(ids: number[]): Promise<boolean>;
  update(id: number, data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
}

// ✅ 비즈니스 레이어 - 자유롭게 확장
class UserRepository extends BaseRepository<User> {
  // 비즈니스 특화 쿼리는 여기에 추가
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getCount();
    return count > 0;
  }

  async findByWorkspace(workspaceId: number): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('user.workspaceId = :workspaceId', { workspaceId })
      .getMany();
  }
}
```

### 회원가입 로직 흐름

```typescript
// POST /api/auth/register
async register(dto: RegisterDto) {
  // 1. 이메일 중복 확인
  if (await userRepo.existsByEmail(dto.email)) {
    throw ConflictException;
  }

  // 2. 초대 코드 유무에 따른 분기
  if (dto.inviteCode) {
    // 2-1. 초대 코드로 기존 워크스페이스 참여
    const workspace = await workspaceRepo.findByInviteCode(dto.inviteCode);
    if (!workspace) {
      throw BadRequestException;
    }
    
    // Member로 생성
    const user = await userRepo.save({
      ...dto,
      role: 'member',
      workspaceId: workspace.id
    });
    
    return { user, workspace, accessToken };
  } else {
    // 2-2. 새 워크스페이스 생성
    const workspace = await workspaceRepo.save({
      name: `${dto.name}'s Workspace`,
      inviteCode: generateInviteCode()
    });
    
    // Owner로 생성
    const user = await userRepo.save({
      ...dto,
      role: 'owner',
      workspaceId: workspace.id
    });
    
    // Workspace의 ownerId 업데이트
    await workspaceRepo.update(workspace.id, {
      ownerId: user.id
    });
    
    return { user, workspace, accessToken };
  }
}
```

### 로그인 로직 흐름

```typescript
// POST /api/auth/login
async login(dto: LoginDto) {
  // 1. 사용자 조회
  const user = await userRepo.findByEmail(dto.email);
  if (!user) {
    throw UnauthorizedException;
  }

  // 2. 비밀번호 검증
  const isValid = await bcrypt.compare(dto.password, user.password);
  if (!isValid) {
    throw UnauthorizedException;
  }

  // 3. 워크스페이스 조회
  const workspace = await workspaceRepo.findById(user.workspaceId);

  // 4. JWT 토큰 생성
  const accessToken = jwtService.sign({
    sub: user.id,
    email: user.email
  });

  return { user, workspace, accessToken };
}
```

---

## 데이터베이스 스키마

### User Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt hash
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,             -- 'owner' | 'member'
  "workspaceId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("workspaceId") REFERENCES workspaces(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_workspace ON users("workspaceId");
```

### Workspace Table

```sql
CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  "inviteCode" VARCHAR(20) UNIQUE NOT NULL,  -- format: WORK-XXXXXX
  "ownerId" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY ("ownerId") REFERENCES users(id)
);

CREATE INDEX idx_workspaces_invite_code ON workspaces("inviteCode");
CREATE INDEX idx_workspaces_owner ON workspaces("ownerId");
```

### 초대 코드 생성 규칙

```typescript
// 형식: WORK-XXXXXX (X는 영숫자 대문자)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `WORK-${code}`;
}

// 예시: WORK-A3F7K9, WORK-ZX8M2Q
```

---

## API 명세

### 1. 회원가입

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```typescript
{
  email: string;        // 이메일 (unique)
  password: string;     // 비밀번호 (최소 6자)
  name: string;         // 이름 (최소 2자)
  inviteCode?: string;  // 초대 코드 (선택)
}
```

**Response** (201 Created):
```typescript
{
  user: {
    id: number;
    email: string;
    name: string;
    role: 'owner' | 'member';
    workspaceId: number;
    createdAt: string;
  },
  workspace: {
    id: number;
    name: string;
    inviteCode: string;
    ownerId: number | null;
    createdAt: string;
  },
  accessToken: string;
}
```

**Error Responses**:
- `400 Bad Request`: 유효성 검증 실패
- `409 Conflict`: 이미 존재하는 이메일

### 2. 로그인

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```typescript
{
  email: string;     // 이메일
  password: string;  // 비밀번호
}
```

**Response** (200 OK):
```typescript
{
  user: {
    id: number;
    email: string;
    name: string;
    role: 'owner' | 'member';
    workspaceId: number;
  },
  workspace: {
    id: number;
    name: string;
    inviteCode: string;
    ownerId: number;
  },
  accessToken: string;
}
```

**Error Responses**:
- `401 Unauthorized`: 잘못된 이메일 또는 비밀번호

---

## 테스트 가이드

### 테스트 구조

```
test/
├── e2e/                    # E2E 테스트 (실제 HTTP 요청)
│   └── auth/
│       ├── register.e2e-spec.ts
│       └── login.e2e-spec.ts
│
├── unit/                   # 유닛 테스트 (모킹)
│   ├── services/
│   │   └── auth.service.spec.ts
│   └── repositories/
│       ├── base.repository.spec.ts
│       ├── user.repository.spec.ts
│       └── workspace.repository.spec.ts
│
└── helpers/                # 테스트 헬퍼
    ├── test-app.helper.ts      # NestJS 앱 초기화
    ├── test-database.helper.ts # DB 초기화/정리
    └── test-data.helper.ts     # 테스트 데이터 생성
```

### E2E 테스트 예시

```typescript
describe('회원가입 E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
  });

  afterAll(async () => {
    await TestAppHelper.cleanup();
  });

  afterEach(async () => {
    // 각 테스트 후 DB 초기화
    await TestAppHelper.resetDatabase();
  });

  it('초대 코드 없이 회원가입 → Owner 권한', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'owner@test.com',
        password: 'password123',
        name: 'Owner'
      })
      .expect(201);

    expect(response.body.user.role).toBe('owner');
    expect(response.body.workspace.inviteCode).toMatch(/^WORK-/);
  });

  it('초대 코드로 회원가입 → Member 권한', async () => {
    // 1. Owner 생성
    const ownerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'owner@test.com',
        password: 'password123',
        name: 'Owner'
      });

    const inviteCode = ownerRes.body.workspace.inviteCode;

    // 2. Member 가입
    const memberRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'member@test.com',
        password: 'password123',
        name: 'Member',
        inviteCode
      })
      .expect(201);

    expect(memberRes.body.user.role).toBe('member');
    expect(memberRes.body.workspace.id).toBe(ownerRes.body.workspace.id);
  });
});
```

### 유닛 테스트 예시

```typescript
describe('AuthService Unit', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let workspaceRepo: jest.Mocked<WorkspaceRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            existsByEmail: jest.fn(),
            save: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        // ... 다른 모킹
      ],
    }).compile();

    service = module.get(AuthService);
    userRepo = module.get(UserRepository);
    // ...
  });

  it('초대 코드 없이 회원가입 → 새 워크스페이스 생성', async () => {
    userRepo.existsByEmail.mockResolvedValue(false);
    workspaceRepo.save.mockResolvedValue(mockWorkspace);
    userRepo.save.mockResolvedValue(mockOwner);

    const result = await service.register({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User'
    });

    expect(result.user.role).toBe('owner');
    expect(workspaceRepo.save).toHaveBeenCalled();
  });
});
```

### 테스트 실행 방법

```bash
# 1. 전체 테스트
npm run test

# 2. 유닛 테스트만
npm run test:unit
npm run test:unit:watch    # watch 모드

# 3. E2E 테스트만
npm run test:e2e

# 4. 커버리지 확인
npm run test:cov

# 5. 특정 파일만
npm run test:unit -- auth.service.spec
npm run test:e2e -- register.e2e-spec

# 6. IDE에서 실행 (VS Code/Cursor)
# 테스트 파일에서 우클릭 → "Run Test" 또는 "Debug Test"
```

### 테스트 DB 관리

```bash
# 테스트 DB 접속
make db-test-connect

# SQL 직접 실행
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"

# 테스트 DB 초기화
make db-reset
```

---

## 개발 환경 설정

### 1. 사전 준비

```bash
# Node.js 18+ 설치 확인
node -v

# Docker 설치 확인
docker -v
docker-compose -v
```

### 2. 프로젝트 설정

```bash
# 저장소 클론 후
cd server

# 의존성 설치
npm install

# 환경 변수 설정 (선택)
cp .env.example .env
```

### 3. Docker 컨테이너 시작

```bash
# DB + Redis 시작
make docker-up

# 로그 확인
make docker-logs

# DB 접속 테스트
make db-connect
```

### 4. 개발 서버 실행

```bash
# watch 모드로 실행
npm run dev

# 빌드 후 실행
npm run build
npm run start:prod
```

### 5. VS Code/Cursor 확장 추천

`.vscode/extensions.json`에 추천 확장 목록이 포함되어 있습니다:

- **ESLint**: 코드 스타일 체크
- **Prettier**: 코드 포매팅
- **Jest Runner**: 테스트 실행/디버깅

### 6. 코딩 스타일

- **Linter**: ESLint + Prettier
- **타입**: TypeScript strict 모드
- **포맷**: 자동 포맷 (Prettier)

```bash
# 린트 확인
npm run lint

# 포맷 적용
npm run format
```

---

## 🔍 디버깅 가이드

### DB 데이터 확인

```bash
# 개발 DB
make db-connect
\dt                              # 테이블 목록
SELECT * FROM users;
SELECT * FROM workspaces;
\q

# 테스트 DB
make db-test-connect
```

### 로그 확인

```bash
# Docker 로그
make docker-logs

# 특정 컨테이너 로그
docker logs workwork-postgres -f
docker logs workwork-postgres-test -f
```

### 테스트 디버깅

```typescript
// 테스트에 디버깅 로그 추가
it('테스트', async () => {
  const result = await someFunction();
  
  console.log('🔍 디버깅:', result);
  
  expect(result).toBeDefined();
});
```

VS Code/Cursor에서 중단점(breakpoint) 설정 후 "Debug Test" 실행

---

## 📖 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [Jest 공식 문서](https://jestjs.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

---

## 🚀 배포 가이드 (향후 추가 예정)

- Docker 이미지 빌드
- 환경 변수 설정
- DB 마이그레이션
- 헬스 체크
- 로깅 및 모니터링

---

**마지막 업데이트**: 2025-01-21

