# WorkWork - 팀 기반 일정 관리 서비스

초대 코드로 팀을 구성하고, 1시간 단위 일정을 관리하며, 선택적 알림을 보내는 협업 도구

## 🎯 제공 서비스

### 1. 팀 관리
- **초대 코드 기반 온보딩**: 고유한 초대 코드로 간편하게 팀 구성
- **역할 기반 접근 제어**: Owner와 Member 역할 구분

### 2. 일정 관리
- **1시간 단위 일정**: 세밀한 시간 단위로 일정 생성 및 관리
- **공개/비공개 설정**: 팀원에게 선택적으로 일정 공개
- **실시간 동기화**: 팀원들의 일정 변경사항 즉시 반영

### 3. 알림 시스템
- **스마트 알림**: 필요한 사람에게만 선택적 알림 전송
- **WebSocket 기반**: 실시간 푸시 알림 지원 (예정)

## 🏗️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Cache/Queue**: Redis
- **Auth**: JWT
- **Infrastructure**: Docker + Docker Compose

## 🚀 개발 시작하기

### 1. 초기 설정
```bash
# 전체 설정 (Docker + 의존성 + 환경변수)
make setup

# 또는 단계별로
make docker-up      # Docker 실행
npm install         # 의존성 설치
make setup-env      # 환경변수 파일 생성
```

### 2. 개발 서버 실행
```bash
make dev            # 프론트엔드 + 백엔드 동시 실행
# 서버: http://localhost:4000/api
# 클라이언트: http://localhost:3000
```

### 3. 빌드 및 배포
```bash
make build          # 프로덕션 빌드
```

## 📁 프로젝트 구조

```
workwork/
├── browser/          # React 프론트엔드
├── server/           # NestJS 백엔드
├── config/           # 환경별 설정 파일 (JSON)
└── docker-compose.yml
```

## 🔧 주요 명령어

```bash
make dev            # 개발 서버 실행
make test           # 테스트 실행
make build          # 빌드
make docker-up      # Docker 시작
make docker-down    # Docker 중지
make clean          # 빌드 파일 정리
```

> 💡 설정 시스템: `config/` 폴더의 JSON 파일로 환경별 설정 관리  
> 자세한 내용은 [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) 참고

## 📄 라이선스

MIT License

