# 🚀 Workwork - 모듈 중심 프레임워크

> **"Controller, Service, Repository만 만들면 끝!"**
> 
> 프레임워크 구조를 몰라도 비즈니스 로직에만 집중할 수 있는 모듈 중심 개발 환경

---

## 📁 프로젝트 구조

```
workwork/
├── Env/              # 공통 의존성 & 설정
│   ├── package.json
│   ├── tsconfig/
│   └── db/
│
├── core/             # 프레임워크 (건드릴 필요 없음)
│   ├── server/       # BaseRepository, BaseService, BaseController
│   ├── browser/      # BaseApiService
│   └── shared/       # 공통 타입
│
├── auth/             # 인증 모듈 (예시)
│   ├── server/       # 서버 비즈니스 로직
│   ├── browser/      # UI 컴포넌트
│   └── shared/       # 공유 타입
│
├── common/           # 공통 컴포넌트
│   ├── browser/      # Button, Input 등
│   └── shared/       # UI 타입
│
└── dist/             # 빌드 결과
```

---

## 🎯 핵심 철학

### 1. **모듈 중심 구조**
- 각 기능(auth, board 등)이 독립된 모듈
- 모듈마다 `server`, `browser`, `shared` 폴더

### 2. **역할 분리**
- **Repository**: CRUD만 (어떤 테이블의 어떤 컬럼을)
- **Service**: 비즈니스 로직만 (검증, 변환, 트랜잭션)
- **Controller**: 요청/응답만 (HTTP, Socket, Worker)

### 3. **자동 의존성 주입**
```typescript
@Service('userService')
export class UserService {
  constructor(
    private userRepository: UserRepository  // 👈 자동 주입!
  ) {}
}
```

### 4. **타입 공유**
- `shared/types.ts`에 DTO 정의
- 서버-클라이언트 자동 타입 동기화

---

## ⚡ Quick Start

### 1. 설치
```bash
npm install
```

### 2. 데이터베이스 설정
```bash
# Docker로 PostgreSQL & Redis 실행
npm run db:setup
```

### 3. 개발 서버 실행
```bash
# 서버 (포트 3000)
npm run dev:auth:server

# 브라우저 (포트 5173)
npm run dev:auth:browser
```

### 4. 빌드
```bash
npm run build
```

---

## 📦 새 모듈 만들기

### 예시: Board 모듈

#### 1. 폴더 생성
```bash
mkdir -p board/{server,browser,shared}
```

#### 2. Shared Types 정의
```typescript
// board/shared/types.ts
export interface BoardDto {
  id: number;
  title: string;
  content: string;
  userId: number;
}

export interface CreateBoardDto {
  title: string;
  content: string;
}
```

#### 3. Server 작성

```typescript
// board/server/BoardRepository.ts
import { BaseRepository } from '../../core/server/BaseRepository.js';
import { Repository } from '../../core/server/decorators/index.js';

@Repository('boardRepository')
export class BoardRepository extends BaseRepository {
  protected get model() {
    return this.db.board;
  }

  async findByUserId(userId: number) {
    return await this.model.findMany({ where: { userId } });
  }
}
```

```typescript
// board/server/BoardService.ts
import { BaseService } from '../../core/server/BaseService.js';
import { Service } from '../../core/server/decorators/index.js';

@Service('boardService')
export class BoardService extends BaseService {
  constructor(
    private boardRepository: BoardRepository  // 👈 자동 주입!
  ) {
    super();
  }

  async createBoard(data: CreateBoardDto, userId: number) {
    // 비즈니스 로직: 검증
    if (!data.title || data.title.length < 3) {
      throw new Error('Title too short');
    }

    // Repository 호출
    return await this.boardRepository.create({
      ...data,
      userId,
    });
  }
}
```

```typescript
// board/server/BoardController.ts
import { BaseController } from '../../core/server/BaseController.js';
import { Controller } from '../../core/server/decorators/index.js';

@Controller('http', '/api/boards')
export class BoardController extends BaseController {
  constructor(
    private boardService: BoardService  // 👈 자동 주입!
  ) {
    super();
  }

  protected async executeHandler({ req, res }: any) {
    const boards = await this.boardService.getAllBoards();
    res.json({ success: true, data: boards });
  }
}
```

#### 4. Browser 작성

```typescript
// board/browser/services/boardApi.ts
import { BaseApiService } from '../../../core/browser/BaseApiService';

export class BoardApiService extends BaseApiService {
  async getBoards() {
    return await this.get('/api/boards');
  }
}
```

```typescript
// board/browser/hooks/useBoard.ts
export const useBoard = () => {
  const [boards, setBoards] = useState([]);
  
  const fetchBoards = async () => {
    const response = await boardApi.getBoards();
    if (response.success) {
      setBoards(response.data);
    }
  };

  return { boards, fetchBoards };
};
```

```typescript
// board/browser/components/BoardList.tsx
export const BoardList = () => {
  const { boards, fetchBoards } = useBoard();
  
  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <div>
      {boards.map(board => (
        <div key={board.id}>{board.title}</div>
      ))}
    </div>
  );
};
```

---

## 🏗️ 아키텍처

### 의존성 방향
```
common (공통 컴포넌트)
  ↑
core (프레임워크)
  ↑
auth, board, ... (비즈니스 모듈)
```

**규칙:**
- ✅ auth → core
- ✅ auth → common
- ❌ core → auth
- ❌ auth → board

### 계층 구조 (각 모듈 내)
```
Controller (요청/응답)
    ↓
Service (비즈니스 로직)
    ↓
Repository (CRUD)
    ↓
Database
```

---

## 🔧 설정

### TypeScript 설정
모든 모듈의 tsconfig.json은 `Env/tsconfig/`를 상속:
- `Env/tsconfig/server.json` - 서버용
- `Env/tsconfig/browser.json` - 브라우저용

### 의존성 관리
공통 의존성은 `Env/package.json`에:
- express, socket.io, prisma
- react, axios

모듈별 추가 의존성은 각 모듈의 package.json에

---

## 💡 핵심 원칙

### 1. Repository는 CRUD만
```typescript
// ✅ Good
async findByUsername(username: string) {
  return await this.model.findUnique({ where: { username } });
}

// ❌ Bad - 비즈니스 로직 포함
async findActiveUser(username: string) {
  const user = await this.model.findUnique({ where: { username } });
  if (!user.isActive) throw new Error('User not active');  // ❌
  return user;
}
```

### 2. Service는 비즈니스 로직만
```typescript
// ✅ Good
async register(data: CreateUserDto) {
  // 검증
  if (data.password.length < 6) throw new Error('Password too short');
  
  // 중복 체크
  const existing = await this.userRepository.findByUsername(data.username);
  if (existing) throw new Error('Username exists');
  
  // 해싱
  const hashed = this.hashPassword(data.password);
  
  // 저장
  return await this.userRepository.create({ ...data, password: hashed });
}
```

### 3. Controller는 요청/응답만
```typescript
// ✅ Good
protected async executeHandler({ req, res }: any) {
  try {
    const result = await this.userService.register(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

---

## 📚 더 자세한 내용

- [모듈 구조 상세](./MODULE_STRUCTURE.md)
- [빌드 가이드](./BUILD_GUIDE.md)

---

## 🎉 장점

1. **개발자 친화적**: Controller, Service, Repository만 만들면 끝
2. **자동 DI**: 생성자에 타입만 명시하면 자동 주입
3. **타입 안전**: 서버-클라이언트 타입 공유
4. **확장 용이**: 새 모듈 추가가 쉬움
5. **유지보수성**: 명확한 역할 분리

**모듈만 추가하면 프레임워크가 알아서!** 🚀
