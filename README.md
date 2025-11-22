# workwork

React 기반 브라우저 클라이언트와 Express 서버로 구성된 서버-드리븐 UI 실험용 워크스페이스입니다. `core`가 공통 위젯/레이아웃 엔진을 제공하고, 각 모듈은 “페이지 단위(PageController + PageView)”만 구현합니다.

## 프로젝트 구조
- `core/browser`: 서버드리븐 렌더러와 페이지/위젯 레지스트리 (`App.tsx`, `ScreenHost.tsx`, `WidgetRenderer.tsx`, `PopupHost.tsx`, `main.tsx`, `base-page-controller.ts`, `page-registry.ts`, `register-widgets.ts`, `widgets/Text.tsx`, `styles/`).
- `core/server`: 최소 Express 서버와 모듈 라우터 (`core-server.ts`, `main.ts`).
- `core/shared`: 서버와 클라이언트가 공유하는 타입 (`page.ts`).
- `test/server`: 샘플 스크린 API 모듈 (`test.controller.ts`, `test.module.ts`).
- `test/browser`: 샘플 페이지 컨트롤러/뷰 (`test-page.controller.ts`, `test-page.view.tsx`, `register-test-pages.ts`).
- `test/shared`: 모듈 전용 DTO/타입 (`dto.ts`, `types.ts`).
- `config/browser/vite.config.ts`: 브라우저 빌드/개발용 Vite 설정.
- `tsconfig.base.json`: 서버/브라우저 공통 TypeScript 설정.
- `setup.js`: 초기 워크스페이스 스캐폴딩 스크립트.

## 실행 방법
사전 요구: Node.js, pnpm.

```bash
pnpm install
```

- 브라우저 개발 서버: `pnpm dev:browser` (Vite, 기본 5173 포트).
- 서버 개발 실행: `pnpm dev:server` (ts-node, 기본 3000 포트). 네트워크 제한 환경에서는 호스트/포트를 조정해야 할 수 있습니다.

## 빌드
- 브라우저 번들: `pnpm build:browser` → `dist/web`.
- 서버 트랜스파일: `pnpm build:server` → `dist`.
- 전체 빌드: `pnpm build`.

## 위젯 확장
- 공통 위젯은 `core/browser/register-widgets.ts`에서 등록하며, 예시로 `Text` 위젯이 제공됩니다.
- 모듈은 “페이지 단위”로만 추가합니다:
  - `browser/*-page.controller.ts`: `BasePageController`를 상속, `pageId`와 `load()` 구현.
  - `browser/*-page.view.tsx`: 페이지 전용 React 뷰(모듈 위젯 없음).
  - `browser/register-*-pages.ts`: `registerPage(id, controller, view)`로 등록.
  - `server/*/*.controller.ts` / `*.module.ts`: `/screen/:pageId` 같은 엔드포인트를 정의하고 서버에서 ScreenResponse를 반환.
- 예시: `test/server/test.controller.ts` + `test/browser/test-page.controller.ts` + `test/browser/test-page.view.tsx`.
