# WorkWork API & Web Monorepo 개발 가이드

이 문서는 WorkWork 프로젝트의 아키텍처, 개발 환경 설정, 실행 방법 및 새로운 기능 개발 워크플로우를 안내합니다.

## 1. 핵심 아키텍처 및 설계 원칙

이 프로젝트는 **클린 아키텍처**를 기반으로 한 **pnpm 모노레포**입니다. 각 레이어(패키지)는 명확한 책임을 가지며, 의존성 규칙을 엄격하게 따릅니다.

### 1.1. 레이어 구조와 책임


-   **`infra`**: **환경.** 배포, 운영과 관련된 모든 것을 관리합니다.
    -   `config/.env`: DB 정보, 포트 등 **서버 환경 변수를 정의하는 유일한 파일**입니다.
    -   `docker`: PostgreSQL 등 외부 서비스를 실행하기 위한 Docker 설정이 위치합니다.
    -   `prisma`: 데이터베이스 스키마와 마이그레이션을 관리합니다.
-   **`apps`**: **애플리케이션 진입점 (Entrypoints).** 외부 세계와의 인터페이스입니다.
    -   `api`: Express 기반 API 서버. **환경 변수(`process.env`)를 인지하고 사용하는 유일한 레이어**입니다.
    -   `web`: Vite 기반 React 셸(Shell). 실제 UI는 `domain`에서 가져와 조립합니다.
-   **`03-domain`**: **순수한 비즈니스 로직.**
    -   `server/usecase`: 실제 비즈니스 규칙이 구현된 Usecase가 위치합니다.
    -   `browser`: 재사용 가능한 React 컴포넌트(페이지, 위젯)가 위치합니다.
    -   `shared`: 도메인 내에서 사용되는 DTO, Entity 등이 위치합니다.
    -   **가장 중요한 원칙**: 이 레이어는 외부 환경(DB, API 프레임워크, 환경 변수)에 대해 전혀 알지 못합니다.
-   **`02-feature`**: **도메인 중립적 기능.** 여러 도메인에서 공통적으로 사용될 수 있는 기능(e.g., CRUD 엔진)을 제공합니다.
-   **`01-core`**: **가장 기본적인 공통 모듈.** 저수준 유틸리티, 핵심 타입 등을 제공합니다.

### 1.2. 프론트엔드 아키텍처

프론트엔드 또한 백엔드와 동일한 아키텍처 원칙을 따릅니다.

-   **`apps/web`은 뼈대(Shell)입니다**: 라우팅, 전역 상태 관리 등 애플리케이션의 기본 틀만 제공합니다.
-   **실제 UI는 `03-domain/*/browser`에 있습니다**: 각 도메인은 자신과 관련된 UI 컴포넌트(페이지, 폼 등)를 직접 소유합니다.
-   `apps/web`은 각 도메인 패키지에서 필요한 UI 컴포넌트를 import하여 라우터에 연결하고 화면을 조립하는 역할을 합니다.

---

## 2. 주요 기술 스택 (Dependencies)

-   **모노레포**: `pnpm`
-   **언어**: `TypeScript`
-   **API 서버**: `Express`
-   **웹 클라이언트**: `React`, `Vite`, `react-router-dom`
-   **데이터베이스**: `PostgreSQL` + `Prisma` (ORM)
-   **개발 도구**:
    -   `concurrently`: 여러 개발 서버 동시 실행
    -   `dotenv-cli`: 스크립트 실행 시 `.env` 파일 로드
    -   `tsx`: TypeScript 파일 바로 실행

---

## 3. 개발 환경 설정 및 실행

### 3.1. 최초 설정 (1회만 수행)

1.  **데이터베이스 실행**: Docker를 사용하여 PostgreSQL 서버를 시작합니다.
    ```bash
    # infra/docker 디렉토리에서 실행
    docker-compose up -d
    ```
2.  **의존성 설치**: 프로젝트 루트에서 모든 패키지의 의존성을 설치합니다.
    ```bash
    pnpm install
    ```
3.  **데이터베이스 마이그레이션**: Prisma 스키마를 기반으로 DB에 테이블을 생성합니다.
    ```bash
    pnpm prisma migrate dev --schema=infra/prisma/schema.prisma
    ```
4.  **전체 빌드**: 모든 패키지를 빌드하여 타입 정의 파일 등을 생성합니다.
    ```bash
    pnpm build
    ```

### 3.2. 개발 서버 실행

#### 터미널에서 직접 실행

-   **API 서버와 웹 클라이언트 동시 실행 (권장)**:
    ```bash
    pnpm dev
    ```
-   **API 서버만 실행**:
    ```bash
    pnpm dev:api
    ```
-   **웹 클라이언트만 실행**:
    ```bash
    pnpm dev:web
    ```

#### VS Code 디버거로 실행

VS Code의 "실행 및 디버그" 탭(Ctrl+Shift+D)에서 다음 옵션 중 하나를 선택하고 F5를 누르세요.

-   **`Launch All (API & Web)`**: API 서버와 웹 클라이언트를 모두 디버그 모드로 시작합니다.
-   **`Launch API Server`**: API 서버만 디버그 모드로 시작합니다.
-   **`Launch Web App`**: 웹 클라이언트만 디버그 모드로 시작합니다.

---

## 4. 개발 워크플로우: 새로운 도메인 추가하기

새로운 비즈니스 로직(예: `product` 도메인)을 추가할 때는 다음 절차를 따릅니다.

1.  **디렉토리 생성**: `03-domain/product` 디렉토리와 그 내부에 `server/usecase`, `browser/pages`, `shared` 등의 폴더를 생성합니다.
2.  **`package.json` / `tsconfig.json` 생성**: `user` 도메인을 참고하여 `product` 도메인을 위한 `package.json`과 `tsconfig.json`을 생성합니다.
3.  **루트 설정 파일 업데이트**:
    -   루트 `tsconfig.json`의 `references`와 `paths`에 `product` 도메인을 추가합니다.
    -   `apps/api/tsconfig.json`의 `references`와 `paths`에도 `product` 도메인을 추가합니다.
    -   `apps/web/tsconfig.json`의 `references`에도 `product` 도메인을 추가합니다.
4.  **의존성 재설치 및 빌드**:
    -   `pnpm install`을 실행하여 워크스페이스에 새 패키지를 연결합니다.
    -   `pnpm build`를 실행하여 전체 프로젝트를 재빌드합니다.
5.  **구현**: `product` 도메인 내에서 Usecase와 UI 컴포넌트를 구현하고, `apps` 레이어에서 이를 가져와 사용합니다.

