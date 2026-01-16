# WorkWork 아키텍처 문서

## 🎯 핵심 철학

### Contract-First Design
`.d.ts` 파일로 계약을 먼저 정의하고, 구현은 그 계약을 따라가는 방식

### 프레임워크 레벨 추상화
비즈니스 로직(Aggregate, Domain Event)이 아닌, **HTTP/미들웨어 수준의 순수한 프레임워크 추상화**

### 최소 CRUD
`findById`, `findAll` 같은 비즈니스 용어가 아닌, HTTP 동사 수준의 `get`, `list`, `create`, `update`, `remove`

## 📐 계층 구조

```
┌──────────────────────────────────────────────────┐
│              Entry Point Layer                    │
│         (Controller - HTTP/WS/MQ)                │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│             Application Layer                     │
│           (Service - 비즈니스 로직)                 │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│            Persistence Layer                      │
│         (Repository - ORM 추상화)                 │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│               Core Layer                          │
│  (Contracts + Implementations + Middleware)       │
└──────────────────────────────────────────────────┘
```

## 📦 Core 레이어 구조

### 1. Contracts (계약 정의 - .d.ts)

```
core/contracts/
├── base.d.ts           # 공통 타입
├── controller.d.ts     # ICrudController, IWebSocketHandler, IMessageQueueHandler
├── service.d.ts        # ICrudService, ITransactionalService
├── repository.d.ts     # ICrudRepository, ITransactionalRepository, IOrmAdapter
├── middleware.d.ts     # ILogger, IRequestInterceptor, IResponseTransformer, IErrorHandler
└── config.d.ts         # IAppConfig, IDatabaseConfig, IJwtConfig, IRedisConfig
```

#### 핵심 계약

**ICrudController**
```typescript
interface ICrudController<TCreateDto, TUpdateDto, TEntity> {
  list(query?: QueryFilter): Promise<TEntity[]>;     // GET /resource
  get(id: string): Promise<TEntity>;                 // GET /resource/:id
  create(dto: TCreateDto): Promise<TEntity>;         // POST /resource
  update(id: string, dto: TUpdateDto): Promise<TEntity>; // PUT /resource/:id
  remove(id: string): Promise<void>;                 // DELETE /resource/:id
}
```

**ICrudService**
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

**ICrudRepository**
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

### 2. Implementations (기본 구현)

```
core/implementations/
├── base.controller.ts  # BaseCrudController
├── base.service.ts     # BaseCrudService
└── base.repository.ts  # BaseCrudRepository
```

각 Base 클래스는 해당 계약을 구현하고, 기본 CRUD 로직을 제공합니다.

### 3. Middleware (자동 처리)

```
core/middleware/
├── logging.interceptor.ts      # HTTP 요청/응답 로깅
├── error.filter.ts             # 통합 에러 처리
└── transform.interceptor.ts    # 응답 포맷 통일
```

#### Logging Interceptor
- 모든 HTTP 요청 로깅 (method, url, body, params, query)
- 모든 HTTP 응답 로깅 (statusCode, duration)
- JSON 포맷으로 출력

#### Error Filter
- 모든 에러를 포착하여 로깅
- 통일된 에러 응답 포맷
```json
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

#### Transform Interceptor
- 모든 성공 응답을 통일된 포맷으로 변환
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-17T..."
}
```

### 4. Config (환경변수 관리)

```
core/config/
├── config.module.ts        # Global Config Module
├── config.service.ts       # AppConfigService (타입 안전)
└── validation.schema.ts    # Joi 검증 스키마
```

#### 사용 예시
```typescript
constructor(private config: AppConfigService) {}

// 타입 안전한 접근
const port = this.config.app.port;                 // number
const isProduction = this.config.app.isProduction; // boolean
const dbUrl = this.config.database.url;            // string
const jwtSecret = this.config.jwt.secret;          // string
```

## 🎨 도메인 모듈 구조

```
modules/{domain}/
├── {domain}.types.ts        # Entity, DTO 타입
├── {domain}.repository.ts   # ICrudRepository 구현
├── {domain}.service.ts      # ICrudService 구현
├── {domain}.controller.ts   # ICrudController 구현
└── {domain}.module.ts       # NestJS Module
```

### 구현 예시 (Group 모듈)

#### 1. Types
```typescript
// modules/group/group.types.ts
export interface Group {
  id: string;
  name: string;
  ownerId: string;
  // ...
}

export interface CreateGroupDto {
  name: string;
  ownerId: string;
  // ...
}
```

#### 2. Repository
```typescript
// modules/group/group.repository.ts
@Injectable()
export class GroupRepository
  extends BaseCrudRepository<Group>
  implements ICrudRepository<Group>  // 명시적 계약 구현
{
  constructor(prisma: PrismaClient) {
    super(prisma, 'group');  // 모델명만 전달
  }

  // 기본 CRUD는 자동 구현
  // 커스텀 쿼리만 추가
  async findByOwner(ownerId: string): Promise<Group[]> {
    return this.client.group.findMany({
      where: { ownerId },
      include: { members: true },
    });
  }
}
```

#### 3. Service
```typescript
// modules/group/group.service.ts
@Injectable()
export class GroupService
  extends BaseCrudService<Group, CreateGroupDto, UpdateGroupDto>
  implements ICrudService<Group, CreateGroupDto, UpdateGroupDto>  // 명시적 계약 구현
{
  constructor(groupRepository: GroupRepository) {
    super(groupRepository);
  }

  // 기본 CRUD는 자동 구현
  // 비즈니스 로직만 추가
  async addMember(groupId: string, dto: AddMemberDto): Promise<Group> {
    return this.groupRepository.addMember(groupId, dto.userId);
  }
}
```

#### 4. Controller
```typescript
// modules/group/group.controller.ts
@Controller('groups')
export class GroupController
  extends BaseCrudController<CreateGroupDto, UpdateGroupDto, Group>
  implements ICrudController<CreateGroupDto, UpdateGroupDto, Group>  // 명시적 계약 구현
{
  constructor(groupService: GroupService) {
    super(groupService);
  }

  // 기본 CRUD는 자동 구현:
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

## 🔄 데이터 흐름

```
HTTP Request
    ↓
LoggingInterceptor (요청 로깅)
    ↓
Controller.create(dto)
    ↓
Service.create(dto)
    ↓
Repository.create(data)
    ↓
Prisma ORM
    ↓
Database
    ↓
Repository → Service → Controller
    ↓
TransformInterceptor (응답 포맷 통일)
    ↓
LoggingInterceptor (응답 로깅)
    ↓
HTTP Response

// 에러 발생 시
Error
    ↓
GlobalExceptionFilter (에러 로깅 & 포맷 통일)
    ↓
HTTP Error Response
```

## 🎯 설계 원칙

### 1. Contract-First
- `.d.ts` 파일로 계약 정의
- 구현은 계약을 따라감
- 컴파일 타임 검증

### 2. Single Responsibility
- Controller: HTTP 요청/응답 처리
- Service: 비즈니스 로직
- Repository: 영속성

### 3. Dependency Inversion
- 인터페이스에 의존
- NestJS IoC Container가 주입

### 4. Open-Closed
- Base 클래스를 확장
- 기존 코드 수정 없이 확장

### 5. Interface Segregation
- 작은 인터페이스로 분리
- 필요한 것만 구현

## ✅ 장점

### 1. 최소 코드
- 기본 CRUD는 자동 생성
- 비즈니스 로직만 작성

### 2. 타입 안정성
- `.d.ts` 계약으로 컴파일 타임 검증
- IDE 자동완성 지원

### 3. 일관성
- 모든 모듈이 동일한 패턴
- 팀원이 바뀌어도 구조 유지

### 4. 자동화
- 로깅, 에러 처리 자동화
- 개발자는 비즈니스 로직에만 집중

### 5. 확장성
- 필요한 것만 override
- 새로운 모듈 추가 용이

## 🆚 기존 방식 vs Contract-First 방식

### 기존 방식 (Domain-Driven)
```typescript
// ❌ 비즈니스 용어 사용
interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  // ... 계속 추가
}

// ❌ Aggregate, ValueObject, DomainEvent 등 복잡한 개념
class UserAggregate extends AggregateRoot<UserProps> {
  // ... 복잡한 도메인 로직
}
```

### Contract-First 방식 (프레임워크 레벨)
```typescript
// ✅ HTTP 동사 수준
interface ICrudRepository<T> {
  get(id: string): Promise<T | null>;
  list(filter?: QueryFilter): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  remove(id: string): Promise<void>;
}

// ✅ 간단한 타입만
interface User {
  id: string;
  email: string;
  name: string;
}
```

## 🚀 확장 포인트

### 1. WebSocket 지원 (선택적)
```typescript
interface IWebSocketHandler {
  handleConnection(client: any): Promise<void>;
  handleDisconnect(client: any): Promise<void>;
  handleMessage(client: any, payload: any): Promise<void>;
}
```

### 2. Message Queue 지원 (선택적)
```typescript
interface IMessageQueueHandler<TData> {
  process(job: { id: string; data: TData }): Promise<void>;
  onCompleted?(job, result): Promise<void>;
  onFailed?(job, error): Promise<void>;
}
```

### 3. 트랜잭션 지원
```typescript
// Service에서 사용
await this.transaction(async (tx) => {
  await tx.group.create(...);
  await tx.groupMember.create(...);
});
```

## 📊 메모리 효율성

### 1. Singleton Services (NestJS IoC)
- NestJS Provider는 기본적으로 Singleton
- 애플리케이션 전체에서 하나의 인스턴스 공유

### 2. Stateless Design
- Service는 상태를 가지지 않음
- 모든 상태는 Database에 저장

### 3. ORM 최적화
- Prisma의 효율적인 쿼리
- 필요한 필드만 select

## 🎯 결론

이 아키텍처는:
1. **간단함**: 비즈니스 로직에만 집중
2. **타입 안전**: 컴파일 타임 검증
3. **일관성**: 모든 모듈이 동일한 패턴
4. **자동화**: 로깅, 에러 처리 자동화
5. **확장성**: 필요한 것만 추가

**개발자는 계약을 따라가기만 하면 됩니다!**

