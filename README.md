# WorkWork - 팀 기반 일정 관리 및 알림 서비스

초대 코드로 팀을 구성하고, 1시간 단위 일정을 관리하며, 선택적 알림을 보내는 협업 도구

## 🎯 주요 기능

- ✅ **초대 코드 기반 팀 구성** - 간편한 온보딩
- ✅ **1시간 단위 일정 관리** - 세밀한 시간 계획
- ✅ **선택적 공개 설정** - 공개/비공개 선택 가능
- ✅ **스마트 알림** - 필요한 사람에게만 알림
- ✅ **실시간 협업** - WebSocket 기반 즉시 알림

## 📁 프로젝트 구조

```
workwork/
├── browser/              # React + TypeScript 프론트엔드
├── server/               # NestJS + TypeScript 백엔드
├── docker-compose.yml    # Docker 환경 설정
├── Makefile             # 편리한 명령어 모음
├── DOCKER_SETUP.md      # Docker 가이드
└── TESTING_GUIDE.md     # 테스트 가이드
```

## 🚀 빠른 시작

### 1. Docker 환경 실행 (PostgreSQL + Redis)

```bash
# Docker 컨테이너 시작
make docker-up

# 또는
docker-compose up -d
```

### 2. 의존성 설치

```bash
# 전체 프로젝트 의존성 설치
make install

# 또는
npm install
```

### 3. 환경 변수 설정

서버 폴더에 `.env` 파일 생성:

```bash
cd server
cp .env.example .env
```

### 4. 개발 서버 실행

```bash
# 전체 실행 (프론트엔드 + 백엔드)
make dev

# 또는 개별 실행
make dev-server   # 백엔드만
make dev-browser  # 프론트엔드만
```

서버: http://localhost:4000/api  
브라우저: http://localhost:3000

## 🛠️ 주요 명령어

### 개발

```bash
make dev           # 전체 개발 서버 실행
make dev-server    # 서버만 실행
make dev-browser   # 브라우저만 실행
```

### Docker

```bash
make docker-up     # Docker 시작
make docker-down   # Docker 중지
make docker-clean  # Docker 완전 삭제 (볼륨 포함)
make docker-logs   # Docker 로그 확인
```

### 데이터베이스

```bash
make db-connect    # PostgreSQL 접속
make db-reset      # 데이터베이스 초기화
```

### 테스트

```bash
make test          # 전체 테스트
make test-watch    # Watch 모드
make test-cov      # 커버리지
make test-e2e      # E2E 테스트
```

### 빌드

```bash
make build         # 전체 빌드
make build-server  # 서버 빌드
make build-browser # 브라우저 빌드
```

### 초기 설정

```bash
make setup   # Docker + 의존성 설치 한번에
```

## 🏗️ 기술 스택

### Frontend (Browser)
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 빌드 도구
- **React Router** - 라우팅

### Backend (Server)
- **NestJS** - Node.js 프레임워크
- **TypeScript** - 타입 안정성
- **TypeORM** - ORM
- **PostgreSQL** - 데이터베이스
- **Redis** - 캐시/메시지 큐
- **JWT** - 인증
- **Socket.io** - WebSocket

## 📚 문서

- [Docker 환경 설정](./DOCKER_SETUP.md) - Docker 사용 가이드
- [테스트 가이드](./TESTING_GUIDE.md) - 테스트 작성 및 실행
- [서버 README](./server/README.md) - 백엔드 상세 문서

## 🧪 테스트

```bash
# 유닛 테스트
cd server && npm run test

# E2E 테스트 (Docker 필요)
cd server && npm run test:e2e

# 커버리지
cd server && npm run test:cov
```

## 📊 데이터베이스

### 개발용 PostgreSQL
- **Host**: localhost:5432
- **Database**: workwork
- **User**: postgres
- **Password**: postgres

### 테스트용 PostgreSQL
- **Host**: localhost:5433
- **Database**: workwork_test
- **User**: postgres
- **Password**: postgres

## 🔐 아키텍처 특징

### 불변 ORM 레이어
- **BaseRepository**: 모든 CRUD는 절대 변경되지 않음
- **비즈니스별 확장**: 조회 메서드만 추가 가능
- **Service Layer**: Repository의 불변 메서드만 사용

### 고성능 구조
- **User Context Cache**: Static 메모리 기반 빠른 접근
- **트랜잭션 최소화**: 단일 쿼리로 빠른 응답
- **WebSocket 연결 풀**: 실시간 알림

## 📝 API 예시

### 회원가입 (새 워크스페이스)
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

### 회원가입 (초대 코드)
```bash
POST /api/auth/register
{
  "email": "member@example.com",
  "password": "password123",
  "name": "김철수",
  "inviteCode": "WORK-ABC123"
}
```

### 로그인
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🤝 기여하기

이슈와 PR은 언제나 환영합니다!

## 📄 라이선스

MIT License

