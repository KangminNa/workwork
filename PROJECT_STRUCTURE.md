
✅ Project Structure
--------------------
root/
├── server/              # Express(Typescript, Decorator 기반)
│   ├── src/
│   │   ├── core/        # BaseApp, Container, Decorators, Resolver 등 핵심 OOP 구조
│   │   ├── modules/     # 도메인별 Controller, Service, Repository
│   │   ├── entities/    # 도메인 엔티티
│   │   └── utils/       # 공통 유틸
│   └── tsconfig.json
│
├── client/              # React (Vite or CRA)
│   ├── src/
│   │   ├── components/  # UI Components
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page 단위 구성
│   │   ├── services/    # API 요청 로직
│   │   ├── types/       # TS 타입 정의
│   │   └── utils/       # 공통 함수
│   └── tsconfig.json
