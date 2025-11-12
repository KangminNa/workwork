# WorkWork Monorepo

전역 환경 설정을 통한 통합 모노레포 프로젝트입니다.

## 📁 프로젝트 구조

이 프로젝트는 Env 폴더를 통해 전역적으로 의존성을 관리하는 모노레포입니다.

```
root/
├── Env/                    # 전역 환경 및 의존성 관리
│   ├── package.json        # 모든 공통 의존성 정의
│   ├── tsconfig/           # 공통 TypeScript 설정
│   │   ├── base.json       # 기본 TypeScript 설정
│   │   ├── server.json     # 서버용 TypeScript 설정
│   │   └── browser.json    # 브라우저용 TypeScript 설정
│   └── README.md           # Env 폴더 사용 가이드
├── server/                 # Express + BullMQ 서버
│   ├── src/
│   │   ├── core/           # 핵심 프레임워크 (DI, 데코레이터)
│   │   ├── modules/        # 비즈니스 로직 모듈
│   │   ├── app.ts
│   │   └── index.ts
│   ├── tsconfig.json       # Env/tsconfig/server.json 확장
│   └── package.json        # @workwork/env 의존성 포함
├── browser/                # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   └── index.ts
│   ├── tsconfig.json       # Env/tsconfig/browser.json 확장
│   └── package.json        # @workwork/env 의존성 포함
└── dist/                   # 통합 빌드 출력
    ├── server/
    └── browser/
```

## 🌟 주요 특징

### 1. Env 폴더를 통한 중앙 집중식 의존성 관리
- **통합 의존성 관리**: 모든 패키지가 동일한 버전의 라이브러리 사용
- **디스크 공간 절약**: 중복 설치 방지
- **간편한 업데이트**: 의존성 업데이트가 한 곳에서 관리됨
- **TypeScript 설정 통합**: 공통 tsconfig 설정도 Env에서 관리

### 2. 패키지 의존성 구조
각 서브 패키지는 `@workwork/env`를 참조:

```json
{
  "dependencies": {
    "@workwork/env": "file:../Env"
  }
}
```

### 3. TypeScript 설정 상속
각 패키지의 `tsconfig.json`은 `Env/tsconfig`의 설정을 확장:

```json
// server/tsconfig.json
{
  "extends": "../Env/tsconfig/server.json"
}

// browser/tsconfig.json
{
  "extends": "../Env/tsconfig/browser.json"
}
```

## 🚀 시작하기

### 설치

```bash
# Env 폴더에서 공통 의존성 설치
cd Env
npm install
cd ..

# 각 패키지의 의존성 설치
cd server && npm install && cd ..
cd browser && npm install && cd ..
```

### 개발 서버 실행

```bash
# 서버 실행
cd server
npm run dev

# 브라우저 앱 실행 (새 터미널)
cd browser
npm run dev
```

### 빌드

```bash
# 서버 빌드
cd server
npm run build

# 브라우저 앱 빌드
cd browser
npm run build
```

## 🔧 의존성 관리

### 새로운 의존성 추가하기

1. `Env/package.json`에 의존성 추가
2. Env 폴더에서 `npm install` 실행

```bash
# 예시
cd Env
# package.json 수정 후
npm install
cd ..
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

## 📚 추가 정보

- [Env 폴더 사용 가이드](./Env/README.md)

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

