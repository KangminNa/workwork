# WorkWork Monorepo

Nx를 기반으로 구성된 React + Nest.js 도메인 주도 모노레포 프로젝트입니다.

## 📂 프로젝트 구조

프로젝트는 크게 `core`, `test`, `config` 폴더로 구성되어 있으며, `core`가 환경 설정과 핵심 로직의 중심 역할을 합니다.

```
workwork/
├── ⚙️ config/                  # [환경 설정 중앙화]
│   ├── tsconfig.base.json   # TypeScript 기본 설정
│   ├── tsconfig.core.json   # 모든 모듈이 상속받는 공통 설정
│   └── jest.preset.js       # Jest 테스트 프리셋
│
├── 🧱 core/                    # [핵심 로직 및 앱]
│   ├── server/              # (구 api) Nest.js 백엔드 애플리케이션
│   ├── browser/             # (구 web) React 프론트엔드 애플리케이션
│   └── shared/              # 공통 라이브러리 (Shared Kernel)
│
├── 🧪 test/                    # [도메인 모듈] (Core 상속 예시)
│   ├── server/              # 서버용 테스트/로직 모듈
│   ├── browser/             # 브라우저용 테스트/로직 모듈
│   └── shared/              # 공용 테스트/로직 모듈
│
├── 📦 dist/                    # [빌드 결과물]
│   ├── core/
│   └── test/
│
└── 📄 tsconfig.base.json       # 루트 설정 (config 폴더 참조)
```

## 🛠 환경 구성 특징

1.  **Core 중심 아키텍처**:
    *   `core` 모듈이 프로젝트의 핵심 환경 설정을 담당합니다.
    *   모든 모듈(`test/*` 등)은 `config/tsconfig.core.json`을 상속받아 일관된 환경에서 동작합니다.

2.  **환경 설정 중앙화 (`config/`)**:
    *   `tsconfig`와 `jest` 등 주요 설정 파일들이 `config` 폴더에 모여 있어 관리가 용이합니다.
    *   각 프로젝트의 설정 파일은 이 `config` 폴더 내의 파일을 참조(`extends`)합니다.

3.  **Server / Browser / Shared 분리**:
    *   각 도메인(`core`, `test`)은 실행 환경에 따라 명확히 구분됩니다.
        *   `server`: Node.js 환경 (Nest.js 등)
        *   `browser`: DOM 환경 (React 등)
        *   `shared`: 공용 로직

4.  **빌드 경로 통일**:
    *   빌드 시 소스 코드 구조와 동일하게 `dist/core/*`, `dist/test/*` 경로에 결과물이 생성됩니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
# Nest.js 서버 실행 (core/server)
npx nx serve server

# React 앱 실행 (core/browser)
npx nx serve browser
```

### 3. 전체 빌드
```bash
# 모든 프로젝트 빌드 (dist 폴더에 생성)
npx nx run-many -t build
```

### 4. 전체 테스트
```bash
# 모든 프로젝트 단위 테스트 실행
npx nx run-many -t test
```

## 📝 새로운 모듈 추가하기

새로운 도메인 모듈을 추가할 때는 `test` 모듈의 구조를 참고하세요.

1.  루트에 폴더 생성 (예: `payment`)
2.  `server`, `browser`, `shared` 라이브러리 생성
3.  `tsconfig`와 `jest.config`에서 `config/` 폴더의 설정을 상속받도록 설정

---
Powered by [Nx](https://nx.dev)
