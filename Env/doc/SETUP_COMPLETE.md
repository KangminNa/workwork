# ✅ 프로젝트 설정 완료

## 📁 최종 구조

```
workwork/
├── Env/                      # 공통 환경 설정
│   ├── package.json          # 공통 의존성
│   ├── tsconfig/
│   │   ├── base.json         # 공통 TypeScript 설정
│   │   ├── server.json
│   │   └── browser.json
│   └── db/
│       ├── docker-compose.yml
│       ├── postgres/
│       ├── redis/
│       └── prisma/
│
├── core/                     # 프레임워크 (수정 불필요)
│   ├── package.json
│   ├── tsconfig.json         ✅
│   ├── server/
│   │   ├── BaseController.ts
│   │   ├── BaseService.ts
│   │   ├── BaseRepository.ts
│   │   ├── Container.ts
│   │   ├── Resolver.ts
│   │   └── decorators/
│   ├── browser/
│   │   └── BaseApiService.ts
│   └── shared/
│       └── types.ts
│
├── auth/                     # 인증 모듈
│   ├── package.json
│   ├── tsconfig.json         ✅
│   ├── server/
│   │   ├── app.ts
│   │   ├── UserRepository.ts
│   │   ├── UserService.ts
│   │   ├── AuthController.ts
│   │   └── UserController.ts
│   ├── browser/
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── shared/
│       └── types.ts
│
├── common/                   # 공통 컴포넌트
│   ├── package.json
│   ├── tsconfig.json         ✅
│   ├── browser/
│   │   └── components/
│   └── shared/
│       └── types.ts
│
├── dist/                     # 빌드 결과
│   ├── core/
│   ├── auth/
│   └── common/
│
├── package.json              # 루트 워크스페이스
└── tsconfig.json             ✅ (프로젝트 참조)
```

---

## 🔧 TypeScript 설정

### 1. 루트 tsconfig.json
```json
{
  "extends": "./Env/tsconfig/base.json",
  "files": [],
  "references": [
    { "path": "./core" },
    { "path": "./auth" },
    { "path": "./common" }
  ]
}
```

### 2. 각 모듈의 tsconfig.json
- **core/tsconfig.json**
- **auth/tsconfig.json**
- **common/tsconfig.json**

모두 다음 설정을 포함:
```json
{
  "extends": "../Env/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "../dist/{module}",
    "rootDir": ".",
    "composite": true
  }
}
```

### 3. Env/tsconfig/base.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",           ✅ 추가됨
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## 🚀 사용 방법

### 설치
```bash
npm install
```

### 빌드
```bash
# 전체 빌드
npm run build

# 모듈별 빌드
npm run build:core
npm run build:auth
npm run build:common
```

### 개발
```bash
# 데이터베이스 실행
npm run db:setup

# Auth 서버 (포트 3000)
npm run dev:auth:server

# Auth 브라우저 (포트 5173)
npm run dev:auth:browser
```

---

## ✨ 주요 특징

### 1. **모듈 중심 구조**
- 각 기능(auth, board 등)이 독립된 모듈
- 모듈마다 `server`, `browser`, `shared` 폴더

### 2. **통합 TypeScript 설정**
- 각 모듈에 **하나의 tsconfig.json**만 존재
- 모든 설정이 `Env/tsconfig/base.json`을 참조
- `composite: true`로 프로젝트 참조 활성화

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

## 📦 새 모듈 추가하기

### 1. 폴더 생성
```bash
mkdir -p board/{server,browser,shared}
```

### 2. tsconfig.json 생성
```json
// board/tsconfig.json
{
  "extends": "../Env/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "../dist/board",
    "rootDir": ".",
    "composite": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "jsx": "react-jsx",
    "paths": {
      "@core/*": ["../core/*"],
      "@board/shared": ["./shared"],
      "@common/*": ["../common/*"]
    }
  },
  "include": ["**/*"],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "../core" },
    { "path": "../common" }
  ]
}
```

### 3. package.json 생성
```json
// board/package.json
{
  "name": "@workwork/board",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev:server": "ts-node-dev --respawn --transpile-only server/app.ts",
    "dev:browser": "vite browser"
  },
  "dependencies": {
    "@workwork/env": "file:../Env",
    "@workwork/core": "file:../core",
    "@workwork/common": "file:../common"
  }
}
```

### 4. 루트 설정 업데이트
```json
// package.json - workspaces에 추가
"workspaces": ["Env", "core", "auth", "common", "board"]

// tsconfig.json - references에 추가
"references": [
  { "path": "./core" },
  { "path": "./auth" },
  { "path": "./common" },
  { "path": "./board" }
]

// package.json - scripts에 추가
"build:board": "npm run build --workspace=@workwork/board"
```

---

## 🎯 핵심 원칙

### 1. 하나의 모듈 = 하나의 tsconfig.json
- ❌ `auth/server/tsconfig.json`
- ❌ `auth/browser/tsconfig.json`
- ✅ `auth/tsconfig.json`

### 2. 모든 tsconfig는 Env를 참조
```json
{
  "extends": "../Env/tsconfig/base.json"
}
```

### 3. Composite 모드 활성화
```json
{
  "compilerOptions": {
    "composite": true
  }
}
```

### 4. 프로젝트 참조 사용
```json
{
  "references": [
    { "path": "../core" },
    { "path": "../common" }
  ]
}
```

---

## 🔍 빌드 결과

빌드 성공 시:
```
dist/
├── core/
│   ├── server/
│   ├── browser/
│   └── shared/
├── auth/
│   ├── server/
│   ├── browser/
│   └── shared/
└── common/
    ├── browser/
    └── shared/
```

---

## 📚 추가 문서

- [README.md](./README.md) - 프로젝트 개요 및 Quick Start
- [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) - 모듈 구조 상세
- [STRUCTURE.md](./STRUCTURE.md) - 전체 구조 다이어그램

---

**모듈만 추가하면 프레임워크가 알아서!** 🚀

