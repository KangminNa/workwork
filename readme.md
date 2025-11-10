# workwork

이 프로젝트는 pnpm 워크스페이스와 Turborepo를 사용한 모노레포 프로젝트입니다.

## 🚀 프로젝트 구조

- `apps/browser`: Vite와 React를 사용한 프론트엔드 애플리케이션입니다.
- `apps/server`: Node.js, Express, TypeScript를 사용한 백엔드 서버입니다.
- `packages/tsconfig`: 공유 TypeScript 설정입니다.
- `packages/types`: 공유 타입 정의입니다.
- `infra`: Docker 등 인프라 관련 설정 파일이 위치합니다.
- `scripts`: 빌드 아티팩트 수집 등 보조 스크립트가 위치합니다.

## ✨ 시작하기

### 사전 요구 사항

- [Node.js](https://nodejs.org/en/) (v18 이상 권장)
- [pnpm](https://pnpm.io/installation)

### 설치

저장소를 클론하고 의존성을 설치합니다.

```bash
git clone <repository-url>
cd workwork
pnpm install
```

## 🛠️ 사용 가능한 스크립트

### 전체 워크스페이스

- `pnpm dev`: 모든 애플리케이션을 개발 모드로 실행합니다.
- `pnpm build`: 모든 애플리케이션을 빌드합니다.
- `pnpm build:dist`: 모든 애플리케이션을 빌드하고 `dist` 폴더로 결과를 수집합니다.
- `pnpm lint`: 모든 패키지와 앱에서 린트를 실행합니다.
- `pnpm format`: Prettier를 사용하여 코드 형식을 맞춥니다.

### 개별 애플리케이션

각 애플리케이션 디렉토리(`apps/browser` 또는 `apps/server`)로 이동하여 다음 명령어를 실행할 수도 있습니다.

- `pnpm dev`: 개발 서버를 시작합니다.
- `pnpm build`: 프로덕션용으로 빌드합니다.

## 💻 기술 스택

- **프레임워크**: React, Express
- **언어**: TypeScript
- **빌드 도구**: Vite, tsc
- **모노레포**: pnpm, Turborepo
- **코드 스타일**: Prettier, ESLint

