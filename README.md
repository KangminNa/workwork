# WorkWork - Modular Express + React Application

서버에서 내린 값을 토대로 브라우저 화면을 동적으로 구성하는 모듈화된 웹 애플리케이션입니다.

## 프로젝트 구조

```
workwork/
├── config/                      # 개발환경 설정 (모든 설정의 중심)
│   ├── package.json            # 전체 프로젝트 의존성 및 스크립트
│   ├── tsconfig.base.json      # 기본 TypeScript 설정
│   ├── tsconfig.server.json    # 서버용 TypeScript 설정 (base 확장)
│   ├── tsconfig.browser.json   # 브라우저용 TypeScript 설정 (base 확장)
│   └── .eslintrc.base.json     # 기본 ESLint 설정
├── core/                        # 핵심 기능 모듈
│   ├── server/                 # 서버 측 코드
│   ├── browser/                # 브라우저 측 코드
│   ├── shared/                 # 공유 코드
│   ├── tsconfig.server.json    # config/tsconfig.server.json 확장
│   ├── tsconfig.browser.json   # config/tsconfig.browser.json 확장
│   └── vite.config.ts          # Vite 설정
├── common/                      # 공통 모듈
│   ├── server/                 # 서버 측 공통 코드
│   ├── browser/                # 브라우저 측 공통 코드
│   ├── shared/                 # 공유 타입/유틸
│   ├── tsconfig.server.json    # config/tsconfig.server.json 확장
│   ├── tsconfig.browser.json   # config/tsconfig.browser.json 확장
│   └── vite.config.ts          # Vite 설정
├── dist/                        # 통합 빌드 산출물
│   ├── server/                 # 서버 빌드 결과
│   │   ├── core/
│   │   └── common/
│   └── client/                 # 클라이언트 빌드 결과
│       ├── core/
│       └── common/
├── package.json -> config/package.json  # 심볼릭 링크
└── .gitignore

```

## 핵심 개념

### 1. Config 중심 구조
- **모든 package.json은 config 폴더에만 존재**
- 각 모듈은 tsconfig.json으로만 config를 참조
- 의존성 관리가 한 곳에 집중되어 관리 용이

### 2. 모듈 구조
- **core**: 핵심 기능 (동적 페이지 렌더링)
- **common**: 공통 타입, 상수, 유틸리티
- **config**: 모든 설정의 중심 (package.json, tsconfig, eslint)

### 3. 폴더 구분
각 모듈은 다음과 같이 구분됩니다:
- **server**: 서버 측 코드 (Express)
- **browser**: 브라우저 측 코드 (React)
- **shared**: 서버와 브라우저 모두에서 사용하는 공유 코드

### 4. 통합 빌드
모든 모듈의 빌드 산출물은 루트의 `dist/` 폴더에 통합됩니다.

## 기술 스택

### Backend
- Node.js
- Express
- TypeScript

### Frontend
- React
- TypeScript
- Vite

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

### 3. 개발 모드 실행

#### 개별 모듈 실행
```bash
# core 모듈 서버
npm run dev:server:core

# core 모듈 클라이언트
npm run dev:client:core

# common 모듈 서버
npm run dev:server:common

# common 모듈 클라이언트
npm run dev:client:common
```

### 4. 프로덕션 빌드
```bash
# 전체 빌드
npm run build

# 서버만 빌드
npm run build:server

# 클라이언트만 빌드
npm run build:client

# 개별 모듈 빌드
npm run build:server:core
npm run build:client:common
```

### 5. 린트 및 타입 체크
```bash
# 전체 린트
npm run lint

# 개별 모듈 린트
npm run lint:core
npm run lint:common
```

### 6. 빌드 정리
```bash
npm run clean
```

## 새 모듈 추가하기

새로운 기능을 추가하려면 새 모듈을 만들면 됩니다:

### 1. 모듈 폴더 생성
```bash
mkdir -p newmodule/{server,browser,shared}
```

### 2. TypeScript 설정 파일 생성

**newmodule/tsconfig.server.json**
```json
{
  "extends": "../config/tsconfig.server.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "../dist/server/newmodule"
  },
  "include": ["server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "browser/**/*"]
}
```

**newmodule/tsconfig.browser.json**
```json
{
  "extends": "../config/tsconfig.browser.json",
  "include": ["browser/**/*", "shared/**/*"],
  "exclude": ["node_modules", "server/**/*"]
}
```

### 3. Vite 설정 파일 생성

**newmodule/vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@newmodule': path.resolve(__dirname, './'),
      '@common': path.resolve(__dirname, '../common'),
      '@core': path.resolve(__dirname, '../core'),
      '@config': path.resolve(__dirname, '../config'),
    },
  },
  root: './browser',
  server: {
    port: 3002, // 다른 포트 사용
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client/newmodule',
    emptyOutDir: true,
  },
});
```

### 4. config/package.json에 스크립트 추가
```json
{
  "scripts": {
    "dev:server:newmodule": "cd ../newmodule && nodemon --watch 'server/**/*' --watch 'shared/**/*' --ext ts --exec 'ts-node' server/index.ts",
    "dev:client:newmodule": "cd ../newmodule && vite",
    "build:server:newmodule": "cd ../newmodule && tsc --project tsconfig.server.json",
    "build:client:newmodule": "cd ../newmodule && vite build"
  }
}
```

## 개발 가이드

### Config 중심 구조의 장점

#### 1. 단일 의존성 관리
- **모든 package.json이 config 폴더에만 존재**
- 의존성 추가/변경 시 한 곳만 수정
- 버전 충돌 없음

#### 2. 통일된 개발환경
- 모든 TypeScript, ESLint 설정은 `config/` 폴더에서 관리
- 각 모듈은 tsconfig로만 config를 extends
- 설정 변경 시 config만 수정하면 모든 모듈에 적용

#### 3. 간결한 모듈 구조
- 각 모듈은 코드와 최소한의 설정(tsconfig, vite.config)만 보유
- package.json이 산발되지 않아 관리 용이

### 빌드 산출물 관리
- 서버 빌드: `dist/server/{모듈명}/`
- 클라이언트 빌드: `dist/client/{모듈명}/`
- 모든 모듈의 빌드 결과가 하나의 dist 폴더에 통합

## 라이선스

ISC

