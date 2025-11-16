# 빌드 가이드

## 📦 빌드 방법

### 1. 전체 빌드 (서버 + 클라이언트)

```bash
# config 폴더에서 실행
cd config
npm run build

# 또는 루트에서 실행
npm run build
```

이 명령어는 다음을 순차적으로 실행합니다:
1. `build:server` - 서버 TypeScript 컴파일
2. `build:client` - 클라이언트 Vite 빌드

### 2. 서버만 빌드

```bash
npm run build:server
```

**출력 위치**: `/dist/server/`

**내용**:
- `core/server/**/*.ts` → `/dist/server/core/`
- `login/server/**/*.ts` → `/dist/server/login/`
- 모든 TypeScript 파일이 JavaScript로 컴파일됨

### 3. 클라이언트만 빌드

```bash
npm run build:client
```

**출력 위치**: `/dist/client/core/`

**내용**:
- `core/browser/**/*` → `/dist/client/core/`
- React 앱이 번들링되어 정적 파일로 생성됨
- `index.html`, `assets/` 폴더 포함

---

## 🧹 빌드 정리

```bash
npm run clean
```

`/dist` 폴더를 완전히 삭제합니다.

---

## 🚀 프로덕션 실행

### 1. 빌드 후 서버 실행

```bash
# 1. 빌드
npm run build

# 2. 서버 실행
node dist/server/core/server/index.js
```

### 2. Nginx 또는 정적 서버로 클라이언트 서빙

```bash
# dist/client/core 폴더를 정적 파일로 서빙
# 예: nginx, serve, etc.
npx serve dist/client/core
```

---

## 📋 빌드 스크립트 상세

### package.json 스크립트

```json
{
  "scripts": {
    "dev:server": "서버 개발 모드 (nodemon + ts-node)",
    "dev:client": "클라이언트 개발 모드 (vite)",
    "build:server": "서버 TypeScript 컴파일",
    "build:client": "클라이언트 Vite 빌드",
    "build": "전체 빌드 (서버 + 클라이언트)",
    "clean": "dist 폴더 삭제"
  }
}
```

---

## 🔧 빌드 설정 파일

### 서버 빌드 설정
- **파일**: `core/tsconfig.server.json`
- **extends**: `../config/tsconfig.server.json`
- **outDir**: `../../dist/server/core`

### 클라이언트 빌드 설정
- **파일**: `core/vite.config.ts`
- **outDir**: `/dist/client/core`

---

## 📁 빌드 결과 구조

```
dist/
├── server/                    # 서버 빌드 결과
│   ├── core/
│   │   ├── server/
│   │   │   ├── index.js
│   │   │   ├── app.js
│   │   │   ├── controllers/
│   │   │   ├── resolver/
│   │   │   └── ...
│   └── login/
│       └── server/
│           ├── controllers/
│           ├── services/
│           └── repositories/
│
└── client/                    # 클라이언트 빌드 결과
    └── core/
        ├── index.html
        └── assets/
            ├── index-[hash].js
            ├── index-[hash].css
            └── ...
```

---

## ⚠️ 주의사항

### 1. Prisma 클라이언트 생성

빌드 전에 Prisma 클라이언트를 생성해야 합니다:

```bash
npx prisma generate
```

### 2. 환경변수 설정

프로덕션 환경에서는 `.env` 파일을 설정하세요:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL="file:./prod.db"
```

### 3. 데이터베이스 마이그레이션

```bash
# 개발 환경
npx prisma migrate dev

# 프로덕션 환경
npx prisma migrate deploy
```

---

## 🎯 빠른 시작 (처음부터)

```bash
# 1. 의존성 설치
npm install

# 2. Prisma 클라이언트 생성
npx prisma generate

# 3. 데이터베이스 마이그레이션
npx prisma migrate dev

# 4. 빌드
npm run build

# 5. 서버 실행
node dist/server/core/server/index.js
```

---

## 🔍 빌드 확인

빌드가 성공했는지 확인:

```bash
# 서버 빌드 확인
ls -la dist/server/core/server/

# 클라이언트 빌드 확인
ls -la dist/client/core/

# 빌드된 서버 실행 테스트
node dist/server/core/server/index.js
```

---

## 💡 팁

### 개발 중에는 빌드 없이 실행

```bash
# 서버 개발 모드 (자동 재시작)
npm run dev:server

# 클라이언트 개발 모드 (HMR)
npm run dev:client
```

### 빌드 후 테스트

```bash
# 1. 빌드
npm run build

# 2. 서버 실행 (백그라운드)
node dist/server/core/server/index.js &

# 3. 클라이언트 서빙
npx serve dist/client/core -p 3000

# 4. 브라우저에서 확인
# http://localhost:3000
```

