# WorkWork API 서버 개발 문서

## 1. 프로젝트 개요 및 아키텍처

-   **서비스 목적**: 일정 관리 및 알림 서비스의 API 서버입니다.
-   **개발 패턴**: 클린 아키텍처 기반의 모노레포 구조를 따릅니다.

### 레이어 구조와 책임

-   **`infra`**: 배포/운영 환경과 관련된 모든 것을 관리합니다.
    -   `config/.env`: 서버 환경 변수(DB 정보, 포트 등)를 정의하는 유일한 파일입니다.
    -   `docker`: 데이터베이스 등 외부 서비스를 실행하기 위한 Docker 설정이 위치합니다.
    -   `prisma`: 데이터베이스 스키마와 마이그레이션을 관리합니다.
-   **`apps/api`**: 애플리케이션의 진입점(Entrypoint)입니다.
    -   Express 서버를 초기화하고 실행합니다.
    -   서버 실행 시점에 `infra/config/.env` 파일을 로드하여 `process.env`를 설정하고, 이를 직접 사용합니다.
    -   `domain` 레이어의 Usecase를 호출하여 비즈니스 로직을 실행합니다.
-   **`03-domain`**: 순수한 비즈니스 로직을 포함합니다.
    -   `server/usecase`: 실제 비즈니스 규칙이 구현된 Usecase가 위치합니다.
    -   `shared`: 도메인 내에서 사용되는 DTO, Entity 등이 위치합니다.
    -   **중요**: 이 레이어는 외부 환경(DB, API 프레임워크, 환경 변수)에 대해 전혀 알지 못합니다.
-   **`02-feature`**: 도메인 중립적인, 재사용 가능한 기능(e.g., CRUD 엔진)을 제공합니다.
-   **`01-core`**: 가장 기본적인 타입, 인터페이스, 저수준 유틸리티를 제공합니다.

---

## 2. 개발 환경 설정 및 실행

### 1단계: 데이터베이스 실행

```bash
# infra/docker 디렉토리에서 실행
docker-compose up -d
```

### 2단계: 의존성 설치

```bash
pnpm install
```

### 3단계: 데이터베이스 마이그레이션

```bash
# pnpm prisma 스크립트는 내부적으로 infra/config/.env 파일을 로드합니다.
pnpm prisma migrate dev --schema=infra/prisma/schema.prisma
```

### 4단계: 전체 프로젝트 빌드

```bash
pnpm build
```

### 5단계: API 서버 실행

```bash
# pnpm dev:api 스크립트는 내부적으로 infra/config/.env 파일을 로드합니다.
pnpm dev:api
```
서버는 `.env` 파일에 정의된 `API_PORT`에서 실행됩니다. (기본값: 3000)

---

## 3. 새로운 도메인 추가 방법

새로운 비즈니스 로직(예: `product` 도메인)을 추가할 때는 다음 절차를 따릅니다.

1.  **디렉토리 생성**: `03-domain/product` 디렉토리와 그 내부에 `server/usecase`, `shared` 등의 폴더를 생성합니다.
2.  **`package.json` / `tsconfig.json` 생성**: `user` 도메인을 참고하여 `product` 도메인을 위한 `package.json`과 `tsconfig.json`을 생성합니다.
3.  **루트 설정 파일 업데이트**:
    -   루트 `tsconfig.json`의 `references`와 `paths`에 `product` 도메인을 추가합니다.
    -   `apps/api/tsconfig.json`의 `references`와 `paths`에 `product` 도메인을 추가합니다.
4.  **의존성 재설치 및 빌드**:
    -   `pnpm install`을 실행하여 워크스페이스에 새 패키지를 연결합니다.
    -   `pnpm build`를 실행하여 전체 프로젝트를 재빌드합니다.

