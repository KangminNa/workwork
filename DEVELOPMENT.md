# 개발 환경 설정

이 프로젝트는 `pnpm`을 사용하는 모노레포입니다. `web` 및 `api` 애플리케이션을 포함하며 `Prisma`를 사용하여 데이터베이스를 관리합니다. 프로젝트 전반에 걸쳐 **TypeScript 5.x** 버전이 사용됩니다.

## 프로젝트 구조 및 의존성

이 모노레포는 다음 주요 패키지로 구성됩니다:

-   **`01-core` (`@workwork/core`)**
    -   핵심 유틸리티, 미들웨어, 타입 정의 등 재사용 가능한 코드를 포함합니다.
    -   `express`, `@types/express`에 의존합니다.

-   **`02-feature` (`@workwork/feature`)**
    -   특정 기능 단위의 로직을 캡슐화한 모듈입니다.
    -   `@workwork/core`에 의존합니다 (`workspace:*`는 로컬 패키지 참조).

-   **`03-domain/*` (login, schedule, user)**
    -   각 도메인(로그인, 스케줄, 사용자)의 비즈니스 로직을 담당합니다.
    -   `@workwork/core`, `@workwork/feature`, `express`, `@types/express`에 의존합니다.

-   **`apps/api` (`@app/api`)**
    -   `express` 기반의 백엔드 API 애플리케이션입니다.
    -   `express`, `reflect-metadata`, `@workwork/core`, `@workwork/feature`에 의존합니다.
    -   개발 시 `tsx`를 사용하여 TypeScript 파일을 직접 실행합니다.

-   **`apps/web` (`@app/web`)**
    -   `React` 및 `Next.js` 기반의 프론트엔드 웹 애플리케이션입니다.
    -   `react`, `react-dom`, `@workwork/core`, `@workwork/feature`에 의존합니다.

### `tsconfig.json` 파일

각 하위 프로젝트에는 `tsconfig.json` 파일이 있습니다. 이 파일은 TypeScript 컴파일러 설정을 정의하며, 각 패키지의 특성에 맞게 독립적인 컴파일 옵션을 가질 수 있습니다. 주요 설정은 다음과 같습니다:

-   `compilerOptions.outDir`: 컴파일된 JavaScript 파일이 저장될 출력 디렉토리 (주로 `dist`).
-   `compilerOptions.rootDir`: TypeScript 소스 파일의 루트 디렉토리 (주로 `src`).
-   `references`: 모노레포 내 다른 TypeScript 프로젝트와의 의존성을 명시하고 증분 빌드를 가능하게 합니다.

### `dist` 폴더

`dist` 폴더는 TypeScript 소스 코드가 JavaScript 코드로 컴파일되어 저장되는 위치입니다. 각 하위 프로젝트 내부에 `dist` 폴더가 있는 것은 각 패키지가 독립적으로 빌드되고 배포될 수 있음을 의미합니다. 컴파일된 결과물은 해당 패키지의 `package.json` 파일의 `main` 및 `types` 필드에 지정된 경로를 통해 참조됩니다.

## 시작하기 전에

1.  **pnpm 설치**: pnpm이 설치되어 있지 않다면 다음 명령어를 사용하여 설치하세요:

    ```bash
    npm install -g pnpm
    ```

2.  **의존성 설치**: 프로젝트의 모든 의존성을 설치합니다.

    ```bash
    pnpm install
    ```

3.  **데이터베이스 설정**: `Prisma`를 사용하므로 데이터베이스 설정이 필요합니다. 자세한 내용은 `infra/prisma/schema.prisma` 파일을 참조하세요.

    데이터베이스 마이그레이션 및 시드:

    ```bash
    pnpm prisma migrate dev
    pnpm prisma db seed
    ```

## 개발 환경 실행

프로젝트 루트 디렉토리에서 다음 명령어를 사용하여 개발 서버를 실행할 수 있습니다.

-   **웹 애플리케이션 실행 (Frontend)**:

    ```bash
    pnpm dev:web
    ```

-   **API 서버 실행 (Backend)**:

    ```bash
    pnpm dev:api
    ```

-   **웹 및 API 모두 실행**: 웹 애플리케이션과 API 서버를 동시에 실행합니다.

    ```bash
    pnpm dev:all
    ```

## 빌드 및 린트

-   **모든 프로젝트 빌드**:

    ```bash
    pnpm build
    ```

-   **모든 프로젝트 린트 실행**:

    ```bash
    pnpm lint
    ```
