# 📁 프로젝트 구조

## 최종 구조

```
workwork/
├── .git/
├── .vscode/
├── .gitignore
├── package.json              # 루트 워크스페이스 설정
├── tsconfig.json             # 프로젝트 참조 설정
├── README.md                 # 메인 문서
├── MODULE_STRUCTURE.md       # 모듈 구조 상세
│
├── Env/                      # 공통 환경 설정
│   ├── package.json          # 공통 의존성
│   ├── tsconfig/
│   │   ├── base.json
│   │   ├── server.json
│   │   └── browser.json
│   └── db/
│       ├── docker-compose.yml
│       ├── postgres/
│       ├── redis/
│       └── prisma/
│           └── schema.prisma
│
├── core/                     # 프레임워크 (수정 불필요)
│   ├── package.json
│   ├── server/
│   │   ├── tsconfig.json
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
│   ├── browser/
│   │   ├── tsconfig.json
│   │   └── BaseApiService.ts
│   └── shared/
│       └── types.ts
│
├── auth/                     # 인증 모듈
│   ├── package.json
│   ├── server/
│   │   ├── tsconfig.json
│   │   ├── app.ts            # 서버 진입점
│   │   ├── UserRepository.ts
│   │   ├── UserService.ts
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── entities/
│   │   │   └── User.ts
│   │   └── dto/
│   │       ├── CreateUserDto.ts
│   │       ├── LoginDto.ts
│   │       └── UserResponseDto.ts
│   ├── browser/
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── App.tsx           # 브라우저 진입점
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
│   └── shared/
│       └── types.ts          # 공유 DTO
│
├── common/                   # 공통 컴포넌트
│   ├── package.json
│   ├── browser/
│   │   ├── tsconfig.json
│   │   └── components/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Layout.tsx
│   └── shared/
│       └── types.ts
│
└── dist/                     # 빌드 결과 (자동 생성)
    ├── core/
    ├── auth/
    └── common/
```

---

## 모듈별 설명

### 🔧 Env (Environment)
- **역할**: 전체 프로젝트의 공통 의존성과 설정
- **내용**:
  - package.json: express, react, prisma 등 공통 패키지
  - tsconfig: base, server, browser 설정
  - db: Docker Compose, Prisma 스키마

### 🎯 core (Framework)
- **역할**: 프레임워크 핵심 기능
- **개발자가 신경 쓸 필요 없음**
- **내용**:
  - server: BaseController, BaseService, BaseRepository, DI Container
  - browser: BaseApiService, API 인터셉터
  - shared: ApiResponse 등 공통 타입

### 🔐 auth (Authentication Module)
- **역할**: 로그인, 회원가입 등 인증 기능
- **구조**:
  - server: UserRepository, UserService, AuthController
  - browser: LoginPage, useAuth hook, authApi
  - shared: LoginDto, RegisterDto, UserDto

### 🎨 common (Common Components)
- **역할**: 재사용 가능한 UI 컴포넌트
- **구조**:
  - browser: Button, Input, Layout 등
  - shared: UI 관련 타입

---

## 📊 의존성 그래프

```
┌─────────────────┐
│     common      │  ← 공통 컴포넌트
└────────┬────────┘
         │
┌────────▼────────┐
│      core       │  ← 프레임워크
└────────┬────────┘
         │
┌────────▼────────┐
│  auth, board... │  ← 비즈니스 모듈
└─────────────────┘
```

---

## 🔄 데이터 흐름

### Server (각 모듈 내)
```
HTTP Request
    ↓
Controller (요청/응답 처리)
    ↓
Service (비즈니스 로직)
    ↓
Repository (CRUD)
    ↓
Database
```

### Browser (각 모듈 내)
```
User Interaction
    ↓
Page Component
    ↓
Hook (상태 관리)
    ↓
API Service
    ↓
Server API
```

---

## 🚀 시작 지점

### 서버 개발
1. `auth/server/app.ts` - 서버 진입점
2. 새 모듈 만들 때: `{module}/server/app.ts` 생성

### 브라우저 개발
1. `auth/browser/App.tsx` - 브라우저 진입점
2. `auth/browser/index.html` - HTML 진입점

---

## 📝 파일 명명 규칙

### Server
- `{Entity}Repository.ts` - Repository
- `{Entity}Service.ts` - Service
- `{Feature}Controller.ts` - Controller
- `dto/{Action}{Entity}Dto.ts` - DTO
- `entities/{Entity}.ts` - Entity

### Browser
- `pages/{Feature}Page.tsx` - 페이지
- `components/{Component}.tsx` - 컴포넌트
- `hooks/use{Feature}.ts` - Hook
- `services/{feature}Api.ts` - API Service

### Shared
- `types.ts` - 모듈 공유 타입
- `{feature}.types.ts` - 기능별 타입

---

## ✅ 체크리스트

새 모듈 만들 때:
- [ ] `{module}/server/` 폴더 생성
- [ ] `{module}/browser/` 폴더 생성
- [ ] `{module}/shared/types.ts` 작성
- [ ] `{module}/package.json` 작성
- [ ] `{module}/server/tsconfig.json` 작성 (Env 참조)
- [ ] `{module}/browser/tsconfig.json` 작성 (Env 참조)
- [ ] 루트 `package.json`의 workspaces에 추가
- [ ] 루트 `tsconfig.json`의 references에 추가

---

**명확하고 확장 가능한 구조!** 🎉

