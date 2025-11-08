# WorkWork 알림/일정 서비스 개발 문서

## 1. 프로젝트 개요

### 서비스 목적
하루/주/월/년 단위로 사용자가 일정을 등록하고, 지정한 시간에 알림을 받는 웹 서비스

### 주요 기능
- 로그인 / 회원가입
- 달력 기반 일정 조회/등록 (1시간 단위)
- 알림 설정 (시간대별)
- 문의 메일 전송

### 사용 기술 스택
- **Frontend**: React (TypeScript)
- **Backend**: Node.js + Fastify/Express (TypeScript)
- **DB**: PostgreSQL / Prisma ORM
- **패키지 매니저**: pnpm (모노레포)
- **개발 패턴**: Clean Architecture + Layered + 모노레포

---

## 2. 아키텍처 & 레이어 설계

### 2.1 레이어 구조
- `01-core`: 전역 공통 (DB 클라이언트, HTTP, 타입, 보안)
- `02-feature`: 도메인 중립적 기능 (CRUD 엔진, 알림, 검증, 인증)
- `03-domain`: 실제 비즈니스 도메인 (로그인, 일정, 회원)
- `apps/web`: React 앱
- `apps/api`: Node.js API 서버
- `infra`: 배포/운영 관련 (Docker, Prisma, Config, Scripts)

### 2.2 레이어별 역할

| Layer      | 역할 및 내용                                                          |
| :--------- | :-------------------------------------------------------------------- |
| `01-core`  | 공용 타입, DTO, 공통 유틸, DB 클라이언트, JWT/암호화, HTTP wrapper      |
| `02-feature` | 도메인 독립적 CRUD 엔진, Validation, Notification, Auth, Schedule Engine |
| `03-domain`  | 도메인 특화 비즈니스 규칙, Feature 호출, React/Node 코드              |
| `apps/web` | React 컴포넌트, 페이지, Hooks, 상태관리                               |
| `apps/api` | Fastify/Express 서버, Domain Service 호출                           |
| `infra`      | Docker, Prisma, Config, Scripts, 배포/운영 관련                     |

### 2.3 Domain 구조
- 각 도메인은 동일한 구조를 가집니다.

```
<domain-name>/
├── browser/   : React 컴포넌트, 페이지
├── server/    : API 핸들러
├── service/   : 비즈니스 규칙 (feature 호출)
└── shared/    : domain-level DTO, entity
```
**예시**: `03-domain/login/`

---

## 3. 모노레포 구조

pnpm workspace를 이용하여 모든 레이어 패키지의 의존성을 관리합니다. 각 패키지별 `package.json`이 존재하며, `workspace:*` 의존성을 사용합니다.

```
root
├── 01-core/
├── 02-feature/
├── 03-domain/
│   ├── login/
│   ├── schedule/
│   └── user/
├── apps/
│   ├── web/
│   └── api/
├── infra/
└── pnpm-workspace.yaml
```

---

## 4. 초기 개발 환경 세팅
1.  Node.js 설치
2.  pnpm 설치 (`npm install -g pnpm`)
3.  프로젝트 구조 생성 (`create-monorepo.sh`)
4.  루트에서 의존성 설치:
    ```bash
    pnpm install
    ```
5.  React 앱 실행:
    ```bash
    cd apps/web
    pnpm dev
    ```
6.  API 서버 실행:
    ```bash
    cd apps/api
    pnpm dev
    ```

---

## 5. TypeScript 경로 alias
- 루트 `tsconfig.json`에서 정의합니다.
- domain, feature, core 코드에서 공용 타입/함수를 import할 수 있습니다.

```json
{
  "paths": {
    "@core/*": ["01-core/src/*"],
    "@feature/*": ["02-feature/src/*"],
    "@domain-login/*": ["03-domain/login/*"],
    "@domain-schedule/*": ["03-domain/schedule/*"],
    "@domain-user/*": ["03-domain/user/*"]
  }
}
```

---

## 6. .gitignore 정책
-   `node_modules`, 빌드 산출물, 로그 파일을 제외합니다.
-   `infra` 폴더 내부: local DB, Docker volume, env 파일을 제외합니다.
-   프로젝트 안전성을 위해 `infra/template`, `schema.prisma` 등만 Git으로 관리합니다.

