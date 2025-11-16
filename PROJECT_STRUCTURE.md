# WorkWork 프로젝트 구조

## 🎯 핵심 철학

**Core가 모든 것을 통제합니다**
- `core`가 웹서버(Express)와 브라우저 앱(React)을 모두 관리
- `core`가 모든 UI 디자인과 렌더링을 강제
- 비즈니스 모듈은 **순수 `.ts` 파일만** 사용하여 데이터와 로직만 제공

## 📁 최종 구조

```
workwork/
├── config/                 # 개발 환경 설정
│   ├── package.json       # 유일한 package.json
│   ├── tsconfig.*.json
│   ├── paths.js
│   └── constants.js
│
├── core/                  # 🔧 핵심 인프라
│   ├── server/            # Express 서버
│   │   ├── app.ts         # 서버 메인
│   │   ├── controllers/   # BaseController, GetBaseController
│   │   └── resolver/      # AutoResolver
│   │
│   └── browser/           # React 앱
│       ├── app.tsx        # 브라우저 메인
│       ├── index.html
│       ├── renderer/      # PageRenderer, ComponentRenderer
│       ├── resolver/      # ActionResolver
│       ├── router/        # PageRouter
│       ├── store/         # PageStore
│       └── styles/        # 전역 스타일
│
└── common/                # 🎨 공통 타입
    └── shared/ui/         # UI 인터페이스
        ├── PageModel.ts
        ├── UIComponent.ts
        ├── HeaderModel.ts
        └── FooterModel.ts
```

## 🚀 실행 방법

### 개발 환경

```bash
# 1. 서버 시작
npm run dev:server
# → http://localhost:4000

# 2. 클라이언트 시작 (새 터미널)
npm run dev:client
# → http://localhost:3000
```

### 빌드

```bash
npm run build        # 전체 빌드
npm run build:server # 서버만 빌드
npm run build:client # 클라이언트만 빌드
```

## 🎯 핵심 개념

### 1. Core (완전 통제)
- **역할**: 서버와 브라우저를 모두 관리
- **Server**: Express 서버, AutoResolver, BaseController
- **Browser**: React 앱, PageRenderer, ActionResolver, PageRouter
- **특징**: 모든 UI 디자인 강제

### 2. Common (공통 타입)
- **역할**: UI 인터페이스 정의
- **포함**: PageModel, UIComponent, HeaderModel, FooterModel
- **특징**: 구현체 없음, 순수 타입만

### 3. Config (설정)
- **역할**: 모든 개발 환경 설정 중앙 관리
- **포함**: package.json, tsconfig, paths, constants
- **특징**: 유일한 package.json

## 🔄 Server-Driven UI 흐름

```
1. 브라우저 → GET /api/pages/login
2. Core AutoResolver → Controller 실행
3. Controller → PageModel (JSON) 생성
4. 브라우저 ← PageModel 수신
5. Core PageRenderer → UI 렌더링
6. 사용자 액션 → Core ActionResolver → API 호출
7. 서버 → 액션 처리 및 응답
8. Core ActionResolver → 리다이렉션 처리
```

## 📝 개발 명령어

```bash
npm run dev:server    # 서버 개발 모드 (nodemon + ts-node)
npm run dev:client    # 클라이언트 개발 모드 (vite)
npm run build         # 전체 빌드
npm run build:server  # 서버 빌드 (tsc)
npm run build:client  # 클라이언트 빌드 (vite build)
npm run lint          # ESLint 검사
npm run clean         # 빌드 파일 삭제
```

## ✨ 장점

1. **일관된 UI/UX**: Core가 모든 디자인 통제
2. **빠른 개발**: 비즈니스 로직만 작성, UI는 자동
3. **유지보수 용이**: UI 변경은 Core만 수정
4. **타입 안정성**: TypeScript로 모든 것 관리
5. **확장성**: 새 모듈 추가가 매우 쉬움
6. **단순한 구조**: 최소한의 폴더와 파일

## 🧪 테스트 결과

```bash
✅ 서버: http://localhost:4000 (정상 작동)
✅ 클라이언트: http://localhost:3000 (정상 작동)
✅ Health Check: {"status":"ok"}
✅ TypeScript 컴파일: 오류 없음
✅ Vite 빌드: 정상
```

## 📦 향후 확장

비즈니스 모듈 추가 시:

```
workwork/
├── core/       (변경 없음)
├── common/     (변경 없음)
├── config/     (변경 없음)
└── login/      (새 모듈)
    ├── server/
    │   └── controllers/  # 순수 .ts만!
    └── shared/
        └── types.ts      # 순수 .ts만!
```

**규칙**:
- ✅ 순수 `.ts` 파일만
- ❌ `.tsx`, `.jsx` 금지
- ❌ `browser/` 폴더 금지
- ❌ UI 코드 금지 (Core가 관리)

