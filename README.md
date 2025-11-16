# WorkWork - Server-Driven UI Framework

## 🎯 핵심 철학

**Core가 모든 것을 통제합니다**
- `core`가 웹서버(Express)와 브라우저 앱(React)을 모두 관리
- `core`가 모든 UI 디자인과 렌더링을 강제
- 비즈니스 모듈은 **순수 `.ts` 파일만** 사용하여 데이터와 로직만 제공

## 📁 프로젝트 구조

```
workwork/
├── config/                 # 개발 환경 설정
│   └── package.json       # 유일한 package.json
│
├── core/                  # 🔧 핵심 인프라
│   ├── server/            # Express 서버
│   │   ├── app.ts         # 서버 메인
│   │   ├── controllers/
│   │   └── resolver/
│   │
│   └── browser/           # React 앱
│       ├── app.tsx        # 브라우저 메인
│       ├── renderer/      # UI 렌더링
│       ├── resolver/      # 액션 처리
│       ├── router/        # 라우팅
│       └── store/         # 상태 관리
│
└── common/                # 🎨 공통 타입
    └── shared/ui/         # UI 인터페이스
```

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 서버 시작
npm run dev:server

# 브라우저 앱 시작 (새 터미널)
npm run dev:client

# 접속
http://localhost:3000
```

## 📝 개발 명령어

```bash
npm run dev:server    # 서버 개발 모드
npm run dev:client    # 클라이언트 개발 모드
npm run build         # 전체 빌드
npm run lint          # 린트 검사
npm run clean         # 빌드 파일 삭제
```

## ✨ 특징

- **Server-Driven UI**: 서버가 UI 구조를 결정
- **완전한 타입 안정성**: TypeScript로 모든 것 관리
- **일관된 UI/UX**: Core가 모든 디자인 통제
- **빠른 개발**: 비즈니스 로직만 작성, UI는 자동

## 📖 자세한 문서

자세한 내용은 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 참고하세요.
