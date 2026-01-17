# WorkWork Server Design (Action-based Routing)

이 문서는 현재 서버 구조와 라우팅 설계를 요약하고, 초기 고민거리였던 “명시적 라우팅 vs BaseController 동적 라우팅” 문제를 정리합니다.

## 1) 서버 개요
- NestJS 기반 API 서버 (`apps/server/src`)
- Prisma ORM 사용 (`apps/server/src/prisma/prisma.service.ts`)
- 모듈 단위로 기능을 분리하고, 현재는 `LoginModule`이 핵심 기능을 담당

## 2) 모듈 구성
```
AppModule
 └── LoginModule
     ├── LoginController (action 기반 라우팅)
     ├── AuthUseCase / UserAdminUseCase / UserQueryUseCase
     ├── UserPolicy (권한/역할 규칙)
     ├── UserQueryService / UserCommandService / GroupService / AuthService
     └── UserRepository / GroupRepository (Prisma + Mapper)
```

## 3) 라우팅 설계 (Action-based)
### 규칙
- `POST /api/auth/:action` → `handle{Action}()` 호출
- `GET  /api/auth/:action` → `query{Action}()` 호출

### Action 이름 변환
- `pending` → `handlePending`
- `pending-roots` → `handlePendingRoots`
- `pending_roots` → `handlePendingRoots`

즉, `-`/`_`는 단어 구분자로 처리됩니다.

### 예시
| 기능 | Method | URL | 메서드 |
|---|---|---|---|
| 로그인 | POST | `/api/auth/login` | `handleLogin` |
| 회원가입 | POST | `/api/auth/signup` | `handleSignup` |
| 승인 대기 목록 | POST | `/api/auth/pending` | `handlePending` |
| ROOT 승인/거절 | POST | `/api/auth/approve` | `handleApprove` |
| 유저 목록 조회 | GET | `/api/auth/users` | `queryUsers` |

## 4) 레이어별 규칙 (Controller / Service / Repo)
### Controller 규칙
- **명시적 라우팅 금지**: `@Post('login')` 같은 개별 데코레이터를 쓰지 않음
- **Action 기반만 사용**: `handle*/query*` 메서드로 라우팅
- **DTO 검증 필수**: `@ActionDto()`로 동적 파라미터를 검증
- **비즈니스 로직 최소화**: Service 호출만 조합

### Service 규칙
- **UseCase는 흐름 조합** (Controller와 Service 사이)
- **Query/Command 분리** (조회 vs 변경/검증)
- **도메인 규칙은 Service/Policy로 이동** (Entity는 상태 중심)
- **권한/역할 규칙은 Policy로 분리**
- **HTTP 객체/데코레이터 금지** (Controller 전용)
- Repository 의존은 Service에서만 사용

### Repository 규칙
- **DB 접근 + Mapper 변환만 담당**
- 도메인 규칙/권한 검증 없음
- Prisma 스키마 ↔ Entity 변환은 Repository 내부에서 처리
- 캐시가 필요하면 Repository 데코레이터로 캡슐화

#### Action DTO 예시
```ts
@ActionDto(LoginDto)
async handleLogin(_actor: User | null, params: LoginDto) {
  // params는 검증된 DTO 인스턴스
}
```

## 5) 인증/공개 처리
- 기본은 JWT 인증 필요 (`JwtAuthGuard`)
- 공개 액션은 `@PublicActions('login', 'signup')`으로 지정
- Guard가 `action` 파라미터를 보고 예외 처리

## 6) 요청 처리 흐름
```
HTTP Request
  -> LoginController (BaseController 동적 라우팅)
  -> Service (Auth/User/Group/Permission)
  -> Repository (Prisma + Mapper)
  -> DB
```

## 7) 고민거리와 해결
### 고민: 명시적 라우팅 vs 동적 라우팅 혼용
초기에는 `@Post('login')` 같은 명시 라우팅과  
`POST /api/auth/:action` 기반 동적 라우팅이 함께 존재했습니다.

그 결과:
- 동일 기능이 **두 경로**로 노출되거나
- 하이픈 경로(`pending-roots`)가 **메서드명 매칭 실패**로 404 발생
- 공개 처리(`@Public()`)가 BaseController 경유 라우팅에는 적용되지 않는 혼선 발생

### 결정: 동적 액션 라우팅으로 통일
BaseController 중심으로 모든 엔드포인트를 `/api/{module}/{action}` 패턴으로 통일하고,
공개 액션은 `@PublicActions`로 별도 관리하도록 정리했습니다.

## 8) 장단점 요약
### 장점
- 라우팅 규칙이 단순하고 확장 비용이 낮음
- 컨트롤러 코드가 `handle/query` 메서드 추가만으로 확장 가능

### 단점
- RESTful 스타일과는 다름
- HTTP Method 의미가 약해질 수 있음
- Action 명명 규칙을 잘 지켜야 함

---
필요하면 이후에 REST 스타일로 전환하거나, 모듈별 BaseController를 분리해도 됩니다. 다만 현재 구조에서는 “Action 기반 통일”이 일관성을 가장 잘 보장합니다.
