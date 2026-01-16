# WorkWork - Contract-First NestJS Architecture

`.d.ts` 계약 기반의 프레임워크 레벨 Core 아키텍처

## 🎯 프로젝트 철학

1. **Contract-First**: `.d.ts`로 계약을 먼저 정의하고 구현 강제
2. **프레임워크 레벨 추상화**: 비즈니스 로직이 아닌 HTTP/미들웨어 수준
3. **최소 CRUD**: `get`, `list`, `create`, `update`, `remove`
4. **통합 로깅 & 에러 처리**: 모든 요청/응답/에러 자동 로깅

## 📁 프로젝트 구조

```
packages/server/src/
├── core/                           # Core 레이어 (재사용 가능한 프레임워크)
│   ├── contracts/                 # .d.ts 계약 정의
│   │   ├── base.d.ts             # 공통 타입
│   │   ├── controller.d.ts       # Controller 계약
│   │   ├── service.d.ts          # Service 계약
│   │   ├── repository.d.ts       # Repository 계약
│   │   ├── middleware.d.ts       # Middleware 계약
│   │   └── config.d.ts           # Config 계약
│   │
│   ├── implementations/           # 기본 구현
│   │   ├── base.controller.ts    # BaseCrudController
│   │   ├── base.service.ts       # BaseCrudService
│   │   └── base.repository.ts    # BaseCrudRepository
│   │
│   ├── middleware/                # 미들웨어
│   │   ├── logging.interceptor.ts
│   │   ├── error.filter.ts
│   │   └── transform.interceptor.ts
│   │
│   └── config/                    # Config
│       ├── config.module.ts
│       ├── config.service.ts
│       └── validation.schema.ts
│
├── modules/                        # 도메인 모듈
│   └── group/                     # Group 모듈 (예시)
│       ├── group.types.ts
│       ├── group.repository.ts
│       ├── group.service.ts
│       ├── group.controller.ts
│       └── group.module.ts
│
├── app.module.ts
└── main.ts
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install --legacy-peer-deps
```

### 2. 환경변수 설정

`.env` 파일 생성:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workwork?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. 데이터베이스 설정

```bash
cd packages/server

# Prisma Client 생성
npx prisma generate

# 마이그레이션
npx prisma migrate dev --name init
```

### 4. 서버 실행

```bash
# 개발 모드
npm run server:dev

# 프로덕션 빌드
npm run server:build
npm run server:start
```

## 📋 Core 계약 (Contracts)

### ICrudController

```typescript
interface ICrudController<TCreateDto, TUpdateDto, TEntity> {
  list(query?: QueryFilter): Promise<TEntity[]>;
  get(id: string): Promise<TEntity>;
  create(dto: TCreateDto): Promise<TEntity>;
  update(id: string, dto: TUpdateDto): Promise<TEntity>;
  remove(id: string): Promise<void>;
}
```

### ICrudService

```typescript
interface ICrudService<TEntity, TCreateDto, TUpdateDto> {
  get(id: string, options?: any): Promise<TEntity | null>;
  list(filter?: QueryFilter): Promise<TEntity[]>;
  create(dto: TCreateDto): Promise<TEntity>;
  update(id: string, dto: TUpdateDto): Promise<TEntity>;
  remove(id: string): Promise<void>;
  count(filter?: QueryFilter): Promise<number>;
}
```

### ICrudRepository

```typescript
interface ICrudRepository<TEntity> {
  get(id: string, options?: any): Promise<TEntity | null>;
  list(filter?: QueryFilter): Promise<TEntity[]>;
  findOne(filter: QueryFilter): Promise<TEntity | null>;
  create(data: any): Promise<TEntity>;
  update(id: string, data: any): Promise<TEntity>;
  remove(id: string): Promise<void>;
  count(filter?: QueryFilter): Promise<number>;
  exists(id: string): Promise<boolean>;
}
```

## 🎨 사용 예시 (Group 모듈)

### 1. Controller

```typescript
@Controller('groups')
export class GroupController
  extends BaseCrudController<CreateGroupDto, UpdateGroupDto, Group>
  implements ICrudController<CreateGroupDto, UpdateGroupDto, Group>
{
  constructor(groupService: GroupService) {
    super(groupService);
  }

  // 기본 CRUD 자동 구현:
  // - GET    /groups
  // - GET    /groups/:id
  // - POST   /groups
  // - PUT    /groups/:id
  // - DELETE /groups/:id

  // 추가 엔드포인트만 작성
  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.groupService.addMember(id, dto);
  }
}
```

### 2. Service

```typescript
@Injectable()
export class GroupService
  extends BaseCrudService<Group, CreateGroupDto, UpdateGroupDto>
  implements ICrudService<Group, CreateGroupDto, UpdateGroupDto>
{
  constructor(groupRepository: GroupRepository) {
    super(groupRepository);
  }

  // 기본 CRUD 자동 구현
  // 비즈니스 로직만 추가
  
  async addMember(groupId: string, dto: AddMemberDto): Promise<Group> {
    return this.groupRepository.addMember(groupId, dto.userId);
  }
}
```

### 3. Repository

```typescript
@Injectable()
export class GroupRepository
  extends BaseCrudRepository<Group>
  implements ICrudRepository<Group>
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'group'); // 모델명만 전달
  }

  // 기본 CRUD 자동 구현
  // 커스텀 쿼리만 추가
  
  async findByOwner(ownerId: string): Promise<Group[]> {
    return this.client.group.findMany({
      where: { ownerId },
      include: { members: true },
    });
  }
}
```

## 🔧 미들웨어 (자동 적용)

### 1. Logging Interceptor

모든 HTTP 요청/응답 자동 로깅:

```json
// 요청 로그
{
  "type": "REQUEST",
  "method": "POST",
  "url": "/api/groups",
  "body": { "name": "팀 프로젝트" },
  "timestamp": "2026-01-17T..."
}

// 응답 로그
{
  "type": "RESPONSE",
  "method": "POST",
  "url": "/api/groups",
  "statusCode": 201,
  "duration": "45ms",
  "timestamp": "2026-01-17T..."
}
```

### 2. Error Filter

모든 에러 통합 처리:

```json
// 에러 로그
{
  "type": "ERROR",
  "method": "GET",
  "url": "/api/groups/123",
  "statusCode": 404,
  "message": "Entity with id 123 not found",
  "stack": "...",
  "timestamp": "2026-01-17T..."
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Entity with id 123 not found",
    "timestamp": "2026-01-17T...",
    "path": "/api/groups/123"
  },
  "timestamp": "2026-01-17T..."
}
```

### 3. Transform Interceptor

통일된 응답 포맷:

```json
{
  "success": true,
  "data": { "id": "123", "name": "팀 프로젝트" },
  "timestamp": "2026-01-17T..."
}
```

## 📊 Config (타입 안전)

```typescript
// 사용 예시
constructor(private config: AppConfigService) {}

// 타입 안전한 접근
const port = this.config.app.port;
const isProduction = this.config.app.isProduction;
const dbUrl = this.config.database.url;
const jwtSecret = this.config.jwt.secret;
```

## 🧪 API 테스트

```bash
# Group 생성
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"팀 프로젝트","ownerId":"user-123"}'

# Group 조회
curl http://localhost:3000/api/groups

# Member 추가
curl -X POST http://localhost:3000/api/groups/{groupId}/members \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-456"}'

# Group 수정
curl -X PUT http://localhost:3000/api/groups/{groupId} \
  -H "Content-Type: application/json" \
  -d '{"name":"수정된 이름"}'

# Group 삭제
curl -X DELETE http://localhost:3000/api/groups/{groupId}
```

## 🎯 새로운 모듈 추가하기

### 1. Types 정의

```typescript
// modules/todo/todo.types.ts
export interface Todo {
  id: string;
  title: string;
  // ...
}

export interface CreateTodoDto {
  title: string;
  // ...
}
```

### 2. Repository 구현

```typescript
// modules/todo/todo.repository.ts
@Injectable()
export class TodoRepository
  extends BaseCrudRepository<Todo>
  implements ICrudRepository<Todo>
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'todo');
  }
}
```

### 3. Service 구현

```typescript
// modules/todo/todo.service.ts
@Injectable()
export class TodoService
  extends BaseCrudService<Todo, CreateTodoDto, UpdateTodoDto>
  implements ICrudService<Todo, CreateTodoDto, UpdateTodoDto>
{
  constructor(todoRepository: TodoRepository) {
    super(todoRepository);
  }
}
```

### 4. Controller 구현

```typescript
// modules/todo/todo.controller.ts
@Controller('todos')
export class TodoController
  extends BaseCrudController<CreateTodoDto, UpdateTodoDto, Todo>
  implements ICrudController<CreateTodoDto, UpdateTodoDto, Todo>
{
  constructor(todoService: TodoService) {
    super(todoService);
  }
}
```

### 5. Module 등록

```typescript
// modules/todo/todo.module.ts
@Module({
  controllers: [TodoController],
  providers: [TodoService, TodoRepository, PrismaClient],
  exports: [TodoService],
})
export class TodoModule {}

// app.module.ts에 추가
@Module({
  imports: [GroupModule, TodoModule],
})
```

**끝! 기본 CRUD API가 자동으로 생성됩니다.**

## ✅ 장점

1. **최소 코드**: 기본 CRUD는 자동, 비즈니스 로직만 작성
2. **타입 안전**: `.d.ts` 계약으로 컴파일 타임 검증
3. **일관성**: 모든 모듈이 동일한 패턴
4. **로깅/에러 처리**: 자동화
5. **확장성**: 필요한 것만 override

## 📄 라이선스

MIT

## 👥 기여

이 프로젝트는 학습 목적으로 만들어졌습니다.

