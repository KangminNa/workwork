# WorkWork Monorepo

전역 환경 설정을 통한 통합 모노레포 프로젝트입니다.

## 📦 구조

이 프로젝트는 Env 폴더를 통해 전역적으로 의존성을 관리하는 모노레포입니다.

```
root/
├── Env/                    # 전역 환경 및 의존성 관리
├── server/                 # Express + BullMQ 서버
├── browser/                # React + Vite 프론트엔드
└── packages/tsconfig/      # 공통 TypeScript 설정
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
# 서버 실행
npm run dev:server

# 브라우저 앱 실행
npm run dev:browser
```

### 빌드

```bash
# 서버 빌드
npm run build:server

# 브라우저 앱 빌드
npm run build:browser
```

## 🔧 의존성 관리

### Env 폴더의 역할

모든 공통 의존성은 `Env/package.json`에서 관리됩니다. 이를 통해:

- ✅ 모든 패키지가 동일한 버전의 라이브러리 사용
- ✅ 중복 설치 방지로 디스크 공간 절약
- ✅ 의존성 업데이트가 한 곳에서 관리됨

### 새로운 의존성 추가하기

1. `Env/package.json`에 의존성 추가
2. 루트에서 `npm install` 실행

```bash
# 예시
cd Env
# package.json 수정
cd ..
npm install
```

### 패키지별 특정 의존성

특정 패키지에만 필요한 의존성은 해당 패키지의 `package.json`에 추가할 수 있습니다.

```json
{
  "dependencies": {
    "@workwork/env": "file:../Env",
    "특정-패키지-전용-라이브러리": "^1.0.0"
  }
}
```

## 📚 자세한 내용

- [프로젝트 구조](./PROJECT_STRUCTURE.md)
- [Env 폴더 가이드](./Env/README.md)

## 🛠 기술 스택

### Backend (Server)
- Express.js
- BullMQ (작업 큐)
- Socket.io
- TypeScript

### Frontend (Browser)
- React
- Vite
- TypeScript
- Socket.io Client

### 공통
- TypeScript
- Node.js

