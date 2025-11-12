## 🏗️ 모듈 중심 구조

```
workwork/
├── Env/                          # 공통 의존성 & 설정
│   ├── package.json
│   ├── tsconfig/
│   └── db/
│
├── core/                         # 핵심 프레임워크 모듈
│   ├── server/                   # 서버 프레임워크
│   │   ├── BaseController.ts
│   │   ├── BaseService.ts
│   │   ├── BaseRepository.ts
│   │   ├── Container.ts
│   │   ├── Resolver.ts
│   │   ├── PrismaClient.ts
│   │   ├── decorators/
│   │   │   ├── Controller.ts
│   │   │   ├── Service.ts
│   │   │   └── Repository.ts
│   │   └── queues/
│   ├── browser/                  # 브라우저 프레임워크
│   │   └── BaseApiService.ts
│   └── shared/                   # 프레임워크 공통 타입
│       └── types.ts
│
├── auth/                         # 인증 모듈
│   ├── server/                   # 서버 코드
│   │   ├── entities/
│   │   │   └── User.ts
│   │   ├── dto/
│   │   │   ├── CreateUserDto.ts
│   │   │   ├── LoginDto.ts
│   │   │   └── UserResponseDto.ts
│   │   ├── UserRepository.ts
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── AuthController.ts
│   │   └── UserController.ts
│   ├── browser/                  # 브라우저 코드
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── services/
│   │       └── authApi.ts
│   └── shared/                   # 공유 타입
│       └── types.ts              # LoginDto, RegisterDto, UserDto 등
│
├── common/                       # 공통 컴포넌트 모듈
│   ├── browser/
│   │   └── components/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Layout.tsx
│   └── shared/
│       └── types.ts              # UI 공통 타입
│
└── dist/                         # 빌드 결과
    ├── core/
    ├── auth/
    └── common/
```

---

## 📊 계층 구조

### 1. Core (프레임워크)
**역할:** 모든 모듈의 기반이 되는 프레임워크

- **core/server**: BaseRepository, BaseService, BaseController, DI Container
- **core/browser**: BaseApiService, API 인터셉터
- **core/shared**: ApiResponse, PaginationResponse 등 공통 타입

### 2. Auth (인증 모듈)
**역할:** 로그인, 회원가입 등 인증 기능

- **auth/server**: UserRepository, AuthService, AuthController
- **auth/browser**: LoginPage, RegisterPage, useAuth, authApi
- **auth/shared**: LoginDto, RegisterDto, UserDto

### 3. Common (공통 컴포넌트)
**역할:** 재사용 가능한 UI 컴포넌트

- **common/browser**: Button, Input, Layout 등
- **common/shared**: UI 관련 공통 타입

---

## 🎯 모듈 추가 방법

### 예시: Board (게시판) 모듈

```bash
mkdir -p board/{server,browser,shared}
```

#### 1. Shared Types
```typescript
// board/shared/types.ts
export interface BoardDto {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt: Date;
}

export interface CreateBoardDto {
  title: string;
  content: string;
}
```

#### 2. Server
```typescript
// board/server/BoardRepository.ts
import { BaseRepository } from '../../core/server/BaseRepository';

@Repository('boardRepository')
export class BoardRepository extends BaseRepository {
  protected get model() {
    return this.db.board;
  }
}

// board/server/BoardService.ts
import { BaseService } from '../../core/server/BaseService';

@Service('boardService')
export class BoardService extends BaseService {
  constructor(private boardRepository: BoardRepository) {
    super();
  }
}

// board/server/BoardController.ts
import { BaseController } from '../../core/server/BaseController';

@Controller('http', '/api/boards')
export class BoardController extends BaseController {
  constructor(private boardService: BoardService) {
    super();
  }
}
```

#### 3. Browser
```typescript
// board/browser/services/boardApi.ts
import { BaseApiService } from '../../../core/browser/BaseApiService';

export class BoardApiService extends BaseApiService {
  async getBoards() {
    return await this.get('/api/boards');
  }
}

// board/browser/hooks/useBoard.ts
export const useBoard = () => {
  // 비즈니스 로직
};

// board/browser/components/BoardList.tsx
export const BoardList = () => {
  // UI
};

// board/browser/pages/BoardPage.tsx
export const BoardPage = () => {
  // Page
};
```

---

## 💡 의존성 방향

```
┌─────────────┐
│   common    │ ← 모든 모듈에서 사용 가능
└─────────────┘
      ↑
┌─────────────┐
│    core     │ ← 모든 모듈의 기반
└─────────────┘
      ↑
┌─────────────────────────┐
│  auth, board, ...       │ ← 비즈니스 모듈
└─────────────────────────┘
```

**규칙:**
- ✅ auth → core (O)
- ✅ auth → common (O)
- ❌ core → auth (X)
- ❌ auth → board (X) - 모듈 간 직접 의존 금지

---

## 📦 Import 예시

### Server
```typescript
// auth/server/AuthController.ts
import { BaseController } from '../../core/server/BaseController';
import { Controller } from '../../core/server/decorators';
import type { LoginDto } from '../shared/types';
```

### Browser
```typescript
// auth/browser/pages/LoginPage.tsx
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../common/browser/components/Button';
import type { LoginDto } from '../../shared/types';
```

---

## 🔧 빌드 설정

각 모듈은 독립적으로 빌드 가능:

```bash
# Core 빌드
tsc --project core/server/tsconfig.json

# Auth 빌드
tsc --project auth/server/tsconfig.json

# 전체 빌드
npm run build
```

---

## 🎉 장점

1. **모듈 독립성**: 각 모듈이 독립적으로 개발/테스트 가능
2. **코드 재사용**: common 모듈을 통한 컴포넌트 재사용
3. **명확한 구조**: server/browser/shared로 역할이 명확히 분리
4. **타입 공유**: shared 폴더를 통한 서버-클라이언트 타입 공유
5. **확장 용이**: 새 모듈 추가가 쉬움

---

## 📚 모듈별 책임

| 모듈 | Server | Browser | Shared |
|------|--------|---------|--------|
| **core** | 프레임워크 기반 | API 기반 클래스 | 공통 타입 |
| **auth** | 인증 비즈니스 로직 | 로그인/회원가입 UI | 인증 DTO |
| **board** | 게시판 비즈니스 로직 | 게시판 UI | 게시판 DTO |
| **common** | - | 공통 컴포넌트 | UI 타입 |

---

**모듈 중심 구조로 확장 가능하고 유지보수하기 쉬운 프로젝트!** 🚀

