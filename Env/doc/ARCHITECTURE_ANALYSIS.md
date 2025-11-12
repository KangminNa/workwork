# 프레임워크 구조 분석 및 개선안

## 📊 현재 구조 분석

### 1. 현재 네이밍 규칙 (Resolver.ts 기준)

```typescript
// Resolver.ts 8-11번 줄
const service = container.resolveService(path);
const repoKey = path.replace(/(create|update|delete|get|list).*$/, "");
const repository = container.resolveRepository(repoKey);
```

**현재 방식의 문제점:**

#### ❌ 경로 기반 자동 매칭
```typescript
// HTTP 경로: '/api/board/create'
// path = 'api/board/create'
// service = 'api/board/create' 🔍 서비스 이름
// repository = 'api/board' 🔍 리포지토리 이름 (create 제거)
```

이 방식은 **URL 경로가 곧 서비스/리포지토리 이름**이 되어버립니다.

#### 문제점:

1. **경로와 비즈니스 로직이 강하게 결합됨**
   - URL 변경 시 서비스/리포지토리 이름도 변경 필요
   - RESTful 설계 제약

2. **정규식 매칭의 한계**
   ```typescript
   // ❌ 이런 경로는 어떻게?
   '/api/board/123/comments'  // repository = 'api/board'?
   '/api/user/profile/update' // repository = 'api/user/profile'?
   '/api/posts/search'        // repository = 'api/posts'?
   ```

3. **의존성 명시가 불명확**
   - Controller가 어떤 Service/Repository를 사용하는지 코드에서 알 수 없음

4. **재사용성 부족**
   - 같은 서비스를 다른 경로에서 사용하기 어려움

---

## 🎯 권장 설계 방식

### Option 1: 명시적 의존성 주입 (추천 ⭐)

#### 구조:
```
modules/
├── board/
│   ├── BoardController.ts      # HTTP 엔드포인트
│   ├── BoardService.ts         # 비즈니스 로직
│   └── BoardRepository.ts      # 데이터 접근
├── comment/
│   ├── CommentController.ts
│   ├── CommentService.ts
│   └── CommentRepository.ts
└── user/
    ├── UserController.ts
    ├── UserService.ts
    └── UserRepository.ts
```

#### 코드 예시:

```typescript
// modules/board/BoardRepository.ts
@Repository('boardRepository')
export class BoardRepository extends BaseRepository<Board> {
  // 도메인: Board
}

// modules/board/BoardService.ts
@Service('boardService')
export class BoardService extends BaseService {
  // 생성자에서 명시적으로 의존성 선언
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: UserRepository  // 다른 도메인도 사용 가능
  ) {
    super();
  }

  async createBoard(data: CreateBoardDto) {
    // 비즈니스 로직
    const user = await this.userRepository.findById(data.userId);
    return await this.boardRepository.save({ ...data, author: user });
  }

  async listBoards() {
    return await this.boardRepository.findAll();
  }
}

// modules/board/BoardController.ts
@Controller('http', '/api/boards')
export class BoardController extends BaseController {
  protected type = 'http' as const;

  // 생성자에서 명시적으로 의존성 선언
  constructor(
    private boardService: BoardService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    const method = req.method;
    
    if (method === 'POST') {
      const board = await this.boardService.createBoard(req.body);
      res.json(board);
    } else if (method === 'GET') {
      const boards = await this.boardService.listBoards();
      res.json(boards);
    }
  }
}
```

#### 장점:
- ✅ **명확한 의존성**: 코드만 봐도 어떤 의존성을 사용하는지 알 수 있음
- ✅ **타입 안정성**: TypeScript 자동완성 지원
- ✅ **재사용성**: 여러 Controller에서 같은 Service 사용 가능
- ✅ **테스트 용이**: Mock 주입이 쉬움
- ✅ **유연성**: 경로와 비즈니스 로직 분리

---

### Option 2: 메타데이터 기반 의존성 선언

```typescript
// 데코레이터로 의존성 명시
@Controller('http', '/api/boards')
@InjectService('boardService')
@InjectRepository('boardRepository')
export class BoardController extends BaseController {
  // 자동 주입됨
  protected boardService!: BoardService;
  protected boardRepository!: BoardRepository;
}
```

#### 장점:
- ✅ 선언적 스타일
- ✅ 보일러플레이트 감소

#### 단점:
- ⚠️ 런타임에 의존성 해결
- ⚠️ 타입 체크 약함

---

## 🏗️ 단위 설계 원칙

### Repository: 도메인 엔티티 단위

```typescript
// ✅ 좋은 예
@Repository('userRepository')      // User 엔티티
@Repository('boardRepository')     // Board 엔티티
@Repository('commentRepository')   // Comment 엔티티

// ❌ 나쁜 예
@Repository('userCreateRepository')  // 액션 기반 X
@Repository('apiUserRepository')     // 경로 기반 X
```

**원칙:**
- 1 Repository = 1 도메인 엔티티
- CRUD 메서드 포함
- 데이터 접근만 담당

---

### Service: 비즈니스 유스케이스 단위

```typescript
// ✅ 좋은 예
@Service('boardService')
export class BoardService {
  createBoard()
  updateBoard()
  deleteBoard()
  listBoards()
  getBoard()
  publishBoard()  // 비즈니스 로직
}

@Service('boardSearchService')  // 복잡한 검색은 별도 서비스
export class BoardSearchService {
  searchByKeyword()
  searchByTags()
  getPopularBoards()
}

// ❌ 나쁜 예 - 너무 세분화
@Service('boardCreateService')
@Service('boardUpdateService')
@Service('boardDeleteService')
```

**원칙:**
- 1 Service = 1 도메인의 비즈니스 로직
- 여러 Repository를 조합 가능
- 트랜잭션, 검증, 비즈니스 규칙 처리

---

### Controller: 프로토콜/엔드포인트 단위

```typescript
// ✅ 좋은 예 - RESTful
@Controller('http', '/api/boards')           // 게시판 리스트/생성
@Controller('http', '/api/boards/:id')       // 게시판 상세/수정/삭제

// ✅ 좋은 예 - Action 기반
@Controller('http', '/api/boards/create')
@Controller('http', '/api/boards/update/:id')
@Controller('http', '/api/boards/list')

// ✅ 좋은 예 - Socket.IO
@Controller('topic', 'board:create')
@Controller('topic', 'board:update')

// ✅ 좋은 예 - Worker
@Controller('worker', 'board-notification')
@Controller('worker', 'board-statistics')
```

**원칙:**
- HTTP: REST 리소스 단위 또는 액션 단위
- Socket: 이벤트 단위
- Worker: 백그라운드 작업 단위

---

## 🔧 개선 사항

### 1. Container 개선

**현재:**
```typescript
// 매번 new로 인스턴스 생성 (싱글톤 아님)
resolveController(type: string, path: string) {
  const Ctor = this.controllers.get(key);
  return Ctor ? new Ctor() : null;
}
```

**개선안:**
```typescript
export class Container {
  private controllers = new Map<string, any>();
  private services = new Map<string, any>();
  private repositories = new Map<string, any>();
  
  // 인스턴스 캐시 (싱글톤)
  private serviceInstances = new Map<string, any>();
  private repositoryInstances = new Map<string, any>();

  // Repository 싱글톤
  resolveRepository(name: string) {
    if (this.repositoryInstances.has(name)) {
      return this.repositoryInstances.get(name);
    }
    
    const Ctor = this.repositories.get(name);
    if (!Ctor) return null;
    
    const instance = new Ctor();
    this.repositoryInstances.set(name, instance);
    return instance;
  }

  // Service 싱글톤 + 의존성 주입
  resolveService(name: string) {
    if (this.serviceInstances.has(name)) {
      return this.serviceInstances.get(name);
    }
    
    const Ctor = this.services.get(name);
    if (!Ctor) return null;
    
    // 생성자 파라미터 메타데이터 읽기
    const dependencies = this.resolveDependencies(Ctor);
    const instance = new Ctor(...dependencies);
    this.serviceInstances.set(name, instance);
    return instance;
  }

  // 의존성 자동 해결
  private resolveDependencies(Ctor: any): any[] {
    const paramTypes = Reflect.getMetadata('design:paramtypes', Ctor) || [];
    return paramTypes.map((type: any) => {
      // Repository인지 Service인지 판단하여 주입
      const repoName = Reflect.getMetadata('repository:name', type);
      if (repoName) return this.resolveRepository(repoName);
      
      const serviceName = Reflect.getMetadata('service:name', type);
      if (serviceName) return this.resolveService(serviceName);
      
      return null;
    });
  }
}
```

### 2. Resolver 개선

**현재:**
```typescript
// 경로 기반 자동 매칭
const service = container.resolveService(path);
const repoKey = path.replace(/(create|update|delete|get|list).*$/, "");
const repository = container.resolveRepository(repoKey);
```

**개선안 A: Controller에 의존성 명시**
```typescript
export class Resolver {
  static async handle(type: string, path: string, context: any) {
    const controller = container.resolveController(type, path);
    if (!controller) throw new Error(`No controller for ${type}:${path}`);

    // Controller가 이미 생성자에서 의존성을 받았으므로
    // 추가 주입 불필요
    await controller.execute(context);
  }
}
```

**개선안 B: 메타데이터 기반**
```typescript
export class Resolver {
  static async handle(type: string, path: string, context: any) {
    const ControllerCtor = container.getControllerConstructor(type, path);
    if (!ControllerCtor) throw new Error(`No controller for ${type}:${path}`);

    // 메타데이터에서 의존성 읽기
    const serviceName = Reflect.getMetadata('inject:service', ControllerCtor);
    const repoName = Reflect.getMetadata('inject:repository', ControllerCtor);

    const service = serviceName ? container.resolveService(serviceName) : null;
    const repository = repoName ? container.resolveRepository(repoName) : null;

    const controller = new ControllerCtor(service, repository);
    await controller.execute(context);
  }
}
```

### 3. tsconfig paths 활용

```json
// server/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@modules/*": ["src/modules/*"],
      "@board/*": ["src/modules/board/*"],
      "@user/*": ["src/modules/user/*"]
    }
  }
}
```

```typescript
// 깔끔한 import
import { BoardService } from '@board/BoardService';
import { UserRepository } from '@user/UserRepository';
```

---

## 📝 권장 프로젝트 구조

```
server/src/
├── core/                           # 프레임워크 핵심
│   ├── decorators/
│   │   ├── Controller.ts
│   │   ├── Service.ts
│   │   ├── Repository.ts
│   │   └── Inject.ts              # 🆕 의존성 주입 데코레이터
│   ├── BaseController.ts
│   ├── BaseService.ts
│   ├── BaseRepository.ts
│   ├── Container.ts                # 🔧 개선 필요
│   └── Resolver.ts                 # 🔧 개선 필요
│
└── modules/                        # 비즈니스 로직
    ├── user/
    │   ├── entities/
    │   │   └── User.ts             # 엔티티 정의
    │   ├── dto/
    │   │   ├── CreateUserDto.ts    # 요청 DTO
    │   │   └── UserResponseDto.ts  # 응답 DTO
    │   ├── UserRepository.ts       # 데이터 접근
    │   ├── UserService.ts          # 비즈니스 로직
    │   ├── UserHttpController.ts   # HTTP API
    │   └── UserSocketController.ts # Socket.IO (선택)
    │
    ├── board/
    │   ├── entities/
    │   │   └── Board.ts
    │   ├── dto/
    │   │   ├── CreateBoardDto.ts
    │   │   └── BoardResponseDto.ts
    │   ├── BoardRepository.ts
    │   ├── BoardService.ts
    │   ├── BoardSearchService.ts   # 복잡한 기능은 별도 서비스
    │   ├── BoardHttpController.ts
    │   └── BoardWorkerController.ts # 백그라운드 작업
    │
    └── comment/
        ├── entities/
        │   └── Comment.ts
        ├── dto/
        ├── CommentRepository.ts
        ├── CommentService.ts
        └── CommentSocketController.ts
```

---

## 🎯 실전 예시: 게시판 + 댓글

### 1. Repository (데이터 접근)

```typescript
// modules/board/BoardRepository.ts
@Repository('boardRepository')
export class BoardRepository extends BaseRepository<Board> {
  async findByUserId(userId: number): Promise<Board[]> {
    return this.items.filter((b: any) => b.userId === userId);
  }

  async findPublished(): Promise<Board[]> {
    return this.items.filter((b: any) => b.published);
  }
}

// modules/comment/CommentRepository.ts
@Repository('commentRepository')
export class CommentRepository extends BaseRepository<Comment> {
  async findByBoardId(boardId: number): Promise<Comment[]> {
    return this.items.filter((c: any) => c.boardId === boardId);
  }
}
```

### 2. Service (비즈니스 로직)

```typescript
// modules/board/BoardService.ts
@Service('boardService')
export class BoardService extends BaseService {
  constructor(
    private boardRepository: BoardRepository,
    private commentRepository: CommentRepository,
    private userRepository: UserRepository
  ) {
    super();
  }

  async createBoard(userId: number, data: CreateBoardDto) {
    // 1. 사용자 검증
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // 2. 게시글 생성
    const board = await this.boardRepository.save({
      ...data,
      userId,
      createdAt: new Date()
    });

    // 3. 알림 큐에 작업 추가
    await this.enqueue('notifications', 'board-created', {
      boardId: board.id,
      userId
    });

    return board;
  }

  async deleteBoard(boardId: number, userId: number) {
    // 1. 게시글 조회
    const board = await this.boardRepository.findById(boardId);
    if (!board) throw new Error('Board not found');
    
    // 2. 권한 검증
    if (board.userId !== userId) throw new Error('Unauthorized');

    // 3. 댓글도 함께 삭제
    const comments = await this.commentRepository.findByBoardId(boardId);
    for (const comment of comments) {
      await this.commentRepository.delete(comment.id);
    }

    // 4. 게시글 삭제
    return await this.boardRepository.delete(boardId);
  }

  async getBoardWithComments(boardId: number) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) throw new Error('Board not found');

    const comments = await this.commentRepository.findByBoardId(boardId);
    
    return {
      ...board,
      comments
    };
  }
}
```

### 3. Controller (엔드포인트)

```typescript
// modules/board/BoardHttpController.ts
@Controller('http', '/api/boards')
export class BoardHttpController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private boardService: BoardService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    const method = req.method;
    const userId = req.user?.id; // 인증 미들웨어에서 주입

    switch (method) {
      case 'POST':
        const board = await this.boardService.createBoard(userId, req.body);
        res.status(201).json(board);
        break;

      case 'GET':
        const boards = await this.boardService.listBoards();
        res.json(boards);
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

// modules/board/BoardDetailController.ts
@Controller('http', '/api/boards/:id')
export class BoardDetailController extends BaseController {
  protected type = 'http' as const;

  constructor(
    private boardService: BoardService
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    const boardId = parseInt(req.params.id);
    const userId = req.user?.id;

    switch (req.method) {
      case 'GET':
        const board = await this.boardService.getBoardWithComments(boardId);
        res.json(board);
        break;

      case 'DELETE':
        await this.boardService.deleteBoard(boardId, userId);
        res.status(204).send();
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

// modules/board/BoardWorkerController.ts
@Controller('worker', 'board-created')
export class BoardNotificationWorker extends BaseController {
  protected type = 'worker' as const;

  constructor(
    private notificationService: NotificationService
  ) {
    super();
  }

  protected async executeHandler({ job }: any) {
    const { boardId, userId } = job.data;
    await this.notificationService.sendBoardCreatedNotification(userId, boardId);
  }
}
```

---

## 📊 비교표

| 항목 | 현재 방식 (경로 기반) | 개선안 (명시적 DI) |
|------|---------------------|-------------------|
| **의존성 파악** | ❌ 어려움 (런타임 매칭) | ✅ 명확함 (생성자) |
| **타입 안정성** | ❌ 약함 | ✅ 강함 |
| **재사용성** | ❌ 낮음 | ✅ 높음 |
| **테스트** | ❌ Mock 주입 어려움 | ✅ 쉬움 |
| **유연성** | ❌ 경로에 종속 | ✅ 자유로움 |
| **보일러플레이트** | ✅ 적음 | ⚠️ 약간 증가 |

---

## 🚀 마이그레이션 가이드

### 단계 1: Container 개선
1. 싱글톤 인스턴스 캐싱 추가
2. 의존성 자동 해결 로직 구현

### 단계 2: 데코레이터 추가
```typescript
// @Inject 데코레이터 생성
export function Inject(name: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // 파라미터 메타데이터 저장
  };
}
```

### 단계 3: 기존 코드 마이그레이션
```typescript
// Before
@Controller('http', 'api/board/create')
export class BoardCreateController extends BaseController {
  // service, repository를 Resolver가 자동 주입
}

// After
@Controller('http', '/api/boards')
export class BoardController extends BaseController {
  constructor(
    private boardService: BoardService
  ) {
    super();
  }
}
```

---

## 💡 결론

### 현재 구조의 문제:
1. ❌ 경로와 비즈니스 로직의 강한 결합
2. ❌ 정규식 매칭의 한계
3. ❌ 의존성 파악 어려움

### 권장 방향:
1. ✅ **명시적 의존성 주입** (생성자 기반)
2. ✅ **도메인 중심 구조** (경로 무관)
3. ✅ **단위 원칙**:
   - Repository = 엔티티 단위
   - Service = 도메인 비즈니스 로직
   - Controller = 프로토콜 엔드포인트

이렇게 하면 **확장 가능하고 유지보수하기 쉬운** 프레임워크가 됩니다!

