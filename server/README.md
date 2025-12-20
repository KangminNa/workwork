# WorkWork Server (NestJS)

초대 코드 기반 팀 일정 관리 서비스의 백엔드 서버

## 📁 프로젝트 구조

```
server/
├── src/                            # 소스 코드
│   ├── main.ts                     # 애플리케이션 진입점
│   ├── app.module.ts               # 루트 모듈
│   │
│   ├── common/                     # 공통 유틸리티
│   │   └── utils/
│   │       └── invite-code.util.ts # 초대 코드 생성
│   │
│   ├── config/                     # 설정 파일
│   │   └── database.config.ts      # DB 설정
│   │
│   ├── database/                   # 데이터베이스 레이어
│   │   └── base/
│   │       ├── base.repository.interface.ts  # Repository 인터페이스
│   │       └── base.repository.ts            # Base Repository (불변)
│   │
│   └── modules/                    # 기능 모듈
│       ├── auth/                   # 인증 모듈
│       │   ├── auth.controller.ts  # 회원가입/로그인 API
│       │   ├── auth.service.ts     # 인증 비즈니스 로직
│       │   ├── auth.module.ts
│       │   ├── dto/                # Data Transfer Objects
│       │   │   ├── register.dto.ts
│       │   │   ├── login.dto.ts
│       │   │   └── auth-response.dto.ts
│       │   └── auth.service.spec.ts # 유닛 테스트
│       │
│       ├── users/                  # 사용자 모듈
│       │   ├── entities/
│       │   │   └── user.entity.ts  # User 엔티티
│       │   ├── repositories/
│       │   │   └── user.repository.ts
│       │   └── users.module.ts
│       │
│       └── workspaces/             # 워크스페이스 모듈
│           ├── entities/
│           │   └── workspace.entity.ts
│           ├── repositories/
│           │   └── workspace.repository.ts
│           └── workspaces.module.ts
│
├── test/                           # 테스트 파일
│   ├── auth.e2e-spec.ts            # E2E 테스트
│   ├── jest-e2e.json               # E2E 설정
│   ├── setup.ts                    # 테스트 초기화
│   └── helpers/                    # 테스트 헬퍼
│       ├── test-database.helper.ts # DB 헬퍼
│       └── test-data.helper.ts     # 테스트 데이터 생성
│
├── dist/                           # 빌드 결과물 (src 구조 동일)
│   ├── main.js
│   ├── modules/
│   └── ...
│
├── .env                            # 환경 변수 (git 무시)
├── .env.example                    # 환경 변수 예시
├── nest-cli.json                   # NestJS CLI 설정
├── tsconfig.json                   # TypeScript 설정
└── package.json                    # 의존성 및 스크립트
```

## 🏗️ 아키텍처 설계

### 불변 ORM 레이어

```
Controller (HTTP 처리)
    ↓
Service (비즈니스 로직)
    ↓
Repository (데이터 접근)
    ↓ extends
BaseRepository (불변 CRUD)
    ↓
TypeORM (실제 DB 쿼리)
```

#### 핵심 원칙

1. **BaseRepository는 절대 수정 금지**
   - `save()`, `update()`, `delete()`, `findById()` 는 불변
   - 모든 엔티티가 동일한 CRUD 인터페이스 사용

2. **Repository는 조회 메서드만 확장**
   - `findByEmail()`, `findByWorkspace()` 등 비즈니스별 조회
   - 기본 CRUD는 BaseRepository 상속

3. **Service는 Repository의 불변 메서드만 사용**
   - 비즈니스 로직만 구현
   - TypeORM Repository 직접 주입 금지

### 예시 코드

```typescript
// ✅ 올바른 패턴
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: CreateUserDto) {
    return this.userRepository.save(data);  // 불변 메서드
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);  // 커스텀 조회
  }
}

// ❌ 금지된 패턴
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>  // ❌ 직접 주입 금지
  ) {}
}
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.example .env

# 환경 변수 편집
# DB_HOST, DB_PORT, JWT_SECRET 등 설정
```

### 2. Docker로 데이터베이스 실행

```bash
# 프로젝트 루트에서
docker-compose up -d

# 또는
cd .. && make docker-up
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
# Watch 모드
npm run start:dev

# Debug 모드
npm run start:debug
```

서버: http://localhost:4000/api

## 🧪 테스트

### 유닛 테스트

개별 클래스/함수 단위 테스트 (Mock 사용)

```bash
# 전체 유닛 테스트
npm run test

# 특정 파일 테스트
npm run test -- --testPathPattern=auth.service

# Watch 모드
npm run test:watch

# 커버리지
npm run test:cov
```

**위치**: `src/**/*.spec.ts`

**특징**:
- Mock을 사용하여 의존성 격리
- 빠른 실행 속도
- DB 연결 불필요

**예시**:
```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('성공: 회원가입', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue({ id: 1 } as any);
    
    const result = await service.register(registerDto);
    
    expect(result.user.email).toBe(registerDto.email);
  });
});
```

### E2E 테스트

전체 API 플로우 테스트 (실제 DB 사용)

```bash
# E2E 테스트 (Docker DB 필요)
npm run test:e2e

# Watch 모드
npm run test:e2e:watch
```

**위치**: `test/**/*.e2e-spec.ts`

**특징**:
- 실제 데이터베이스 사용
- 전체 HTTP 요청/응답 테스트
- 각 테스트 후 DB 초기화

**예시**:
```typescript
// auth.e2e-spec.ts
it('/api/auth/register (POST)', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send(registerDto)
    .expect(201);

  expect(response.body).toHaveProperty('user');
  expect(response.body).toHaveProperty('accessToken');
});
```

### 테스트 실행 전 체크리스트

1. ✅ Docker 데이터베이스 실행 중인지 확인
   ```bash
   docker-compose ps
   ```

2. ✅ 테스트 DB 연결 확인
   ```bash
   docker exec -it workwork-postgres-test psql -U postgres -d workwork_test
   ```

3. ✅ 환경 변수 설정 확인
   - `test/.env.test` 파일 존재
   - `DB_PORT=5433` (테스트 DB 포트)

## 📦 빌드 및 배포

### 빌드

```bash
# 빌드 (dist 폴더 생성)
npm run build
```

**빌드 프로세스**:
1. `prebuild`: dist 폴더 삭제 (rimraf)
2. `build`: TypeScript → JavaScript 컴파일
3. 결과: `dist/` 폴더 생성 (src 구조 동일)

**dist 구조**:
```
dist/
├── main.js              # 진입점
├── app.module.js
├── modules/             # src/modules와 동일 구조
│   ├── auth/
│   ├── users/
│   └── workspaces/
└── database/
    └── base/
```

### 프로덕션 실행

```bash
# 빌드된 파일 실행
npm run start:prod

# PM2로 실행 (권장)
pm2 start dist/main.js --name workwork-server -i max
```

## 📡 API 엔드포인트

### 인증 (Auth)

#### POST /api/auth/register
회원가입

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "inviteCode": "WORK-ABC123"  // 선택사항
}
```

**Response (201)**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "owner",  // or "member"
    "workspaceId": 1
  },
  "workspace": {
    "id": 1,
    "name": "홍길동의 워크스페이스",
    "inviteCode": "WORK-ABC123"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
로그인

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**: 회원가입과 동일

## 🔧 개발 가이드

### 새로운 모듈 추가

```bash
# NestJS CLI 사용
nest g module todos
nest g controller todos
nest g service todos

# 파일 구조
src/modules/todos/
├── entities/
│   └── todo.entity.ts
├── repositories/
│   └── todo.repository.ts
├── dto/
│   ├── create-todo.dto.ts
│   └── update-todo.dto.ts
├── todos.controller.ts
├── todos.service.ts
├── todos.module.ts
└── todos.service.spec.ts
```

### Repository 작성 패턴

```typescript
// 1. Entity 정의
@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  title: string;
}

// 2. Repository 생성 (BaseRepository 상속)
@Injectable()
export class TodoRepository extends BaseRepository<Todo> {
  constructor(
    @InjectRepository(Todo)
    repository: Repository<Todo>,
  ) {
    super(repository);
  }

  // 조회 메서드만 추가
  async findByUserId(userId: number): Promise<Todo[]> {
    return this.createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId })
      .getMany();
  }
}

// 3. Service에서 사용
@Injectable()
export class TodosService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async createTodo(data: CreateTodoDto) {
    return this.todoRepository.save(data);  // 불변 메서드
  }

  async getUserTodos(userId: number) {
    return this.todoRepository.findByUserId(userId);  // 커스텀 조회
  }
}
```

### 테스트 작성 패턴

```typescript
// 유닛 테스트
describe('TodosService', () => {
  let service: TodosService;
  let repository: jest.Mocked<TodoRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TodoRepository,
          useValue: {
            save: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get(TodoRepository);
  });

  it('성공: Todo 생성', async () => {
    repository.save.mockResolvedValue({ id: 1 } as any);
    
    const result = await service.createTodo(createTodoDto);
    
    expect(result.id).toBe(1);
  });
});
```

## 🗄️ 데이터베이스

### 개발용 PostgreSQL
- **Host**: localhost:5432
- **Database**: workwork
- **User**: postgres
- **Password**: postgres

### 테스트용 PostgreSQL
- **Host**: localhost:5433
- **Database**: workwork_test
- **User**: postgres
- **Password**: postgres

### 접속 방법

```bash
# 개발 DB
docker exec -it workwork-postgres psql -U postgres -d workwork

# 테스트 DB
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test

# 또는 Makefile 사용
make db-connect
make db-test-connect
```

### 마이그레이션

현재는 `synchronize: true` 설정으로 자동 동기화 사용 중

**프로덕션에서는**:
1. `synchronize: false` 설정
2. TypeORM 마이그레이션 사용
   ```bash
   npm run migration:generate -- -n InitialMigration
   npm run migration:run
   ```

## 🔐 환경 변수

### .env 파일

```env
# Server
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=workwork

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 환경별 설정

- **개발**: `.env`
- **테스트**: `test/.env.test`
- **프로덕션**: 환경 변수 또는 비밀 관리 서비스

## 📝 코딩 컨벤션

### TypeScript

```typescript
// ✅ 좋은 예
export class UserService {
  async findUser(id: number): Promise<User> {
    return this.userRepository.findById(id);
  }
}

// ❌ 나쁜 예
export class UserService {
  async findUser(id: any) {  // any 사용 금지
    return this.userRepository.findById(id);
  }
}
```

### Naming

- **파일**: kebab-case (`user-repository.ts`)
- **클래스**: PascalCase (`UserRepository`)
- **함수/변수**: camelCase (`findByEmail`)
- **상수**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### 금지 사항

1. ❌ BaseRepository 수정
2. ❌ TypeORM Repository 직접 주입
3. ❌ `any` 타입 사용
4. ❌ 테스트 없이 커밋

## 🐛 트러블슈팅

### 빌드 오류

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# dist 폴더 정리
npm run build
```

### 테스트 실패

```bash
# Docker DB 상태 확인
docker-compose ps

# 테스트 DB 초기화
docker exec -it workwork-postgres-test psql -U postgres -c "DROP DATABASE IF EXISTS workwork_test; CREATE DATABASE workwork_test;"

# 테스트 재실행
npm run test:e2e
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :4000

# 프로세스 종료
kill -9 <PID>
```

## 📚 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [프로젝트 전체 README](../README.md)
- [Docker 가이드](../DOCKER_SETUP.md)
- [테스트 가이드](../TESTING_GUIDE.md)

## 🤝 기여하기

1. 새로운 기능은 별도 브랜치에서 개발
2. 테스트 작성 필수
3. 코드 리뷰 후 머지

## 📄 라이선스

MIT License
