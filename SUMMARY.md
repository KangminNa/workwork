# WorkWork 프로젝트 요약

## 📋 프로젝트 개요
- **목적**: 그룹 기반 1시간 단위 Todo 리스트 공유 서비스
- **기술 스택**: TypeScript, React, NestJS, PostgreSQL, Docker
- **구조**: Monorepo (npm workspaces)

## 🏗️ 디렉토리 구조
```
workwork/
├── apps/
│   ├── browser/           # React 프론트엔드
│   └── server/            # NestJS 백엔드
│       ├── config/        # 환경 설정 (app, database, jwt)
│       ├── prisma/        # DB 스키마, 시드
│       └── src/
│           ├── auth/      # 인증 (회원가입, 로그인, 승인, 사용자 관리)
│           ├── group/     # 그룹 조회
│           └── prisma/    # Prisma 서비스
├── docker-compose.yml     # PostgreSQL
└── package.json           # 루트 설정
```

## 🚀 실행 방법

### 1. Docker PostgreSQL 시작
```bash
docker-compose up -d
```

### 2. 데이터베이스 설정
```bash
cd apps/server
npm run prisma:generate
npm run prisma:push
npm run prisma:seed  # ADMIN 계정 생성
```

### 3. 서버 실행
```bash
npm run server:dev
# http://localhost:3000
```

### 4. 브라우저 실행
```bash
npm run browser:dev
# http://localhost:5173
```

## 💾 데이터베이스 (PostgreSQL)
- **Host**: localhost:5432
- **User**: workwork
- **Password**: workwork123
- **Database**: workwork

### 스키마
- **User**: 사용자
  - **ADMIN**: email, username, password, role='ADMIN', status='APPROVED', groupId=null
  - **ROOT**: email, username, password, role='ROOT', status='PENDING/APPROVED/REJECTED', groupId (승인 후)
  - **USER**: email(임시), username, password, role='USER', status='APPROVED', groupId
  - @@unique([username, groupId]): 같은 그룹 내 username 유일
- **Group**: 그룹 (code, name, ownerId)
- **Todo**: 할일 (title, description, completed, groupId, createdBy)

## 🔑 비즈니스 로직

### ADMIN (서비스 관리자)
- **생성 방법**: DB 시드로 직접 생성 (`npm run prisma:seed`)
- **로그인**: 이메일 + 비밀번호
- **권한**: Root 회원가입 승인/거절
- **기본 계정**: 
  - Email: `admin@workwork.com`
  - Password: `admin123`

### ROOT (그룹 오너)
- **회원가입**: 이메일 + username + 비밀번호
- **로그인**: 이메일 + 비밀번호 (상태 무관)
- **상태별 화면**:
  - **PENDING**: 승인 대기 메시지, 기능 제한
  - **APPROVED**: 모든 기능 사용 가능
  - **REJECTED**: 승인 거절 메시지
- **승인 시**: 자동으로 그룹 생성 및 6자리 그룹 코드 발급
- **권한**: 자신의 그룹에 사용자 생성/삭제

### USER (그룹 멤버)
- **생성 방법**: Root가 생성 (username + 비밀번호)
- **로그인**: 이메일(임시) + 비밀번호
- **상태**: 즉시 APPROVED
- **권한**: 그룹 내 Todo 관리

## 🌐 API 엔드포인트

### 인증 (auth)

**Root 회원가입**
```bash
POST /api/auth/signup
{ "email": "root@example.com", "username": "root", "password": "password123" }
```

**로그인 (이메일 + 비밀번호만)**
```bash
POST /api/auth/login
{ "email": "your@email.com", "password": "password123" }

# 응답 예시
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "PENDING"  // or APPROVED, REJECTED
  },
  "groupCode": "ABC123"  // 승인된 경우만
}
```

**ADMIN - Root 승인 대기 목록**
```bash
GET /api/auth/pending-roots/:adminUserId
```

**ADMIN - Root 승인/거절**
```bash
PATCH /api/auth/approve-root/:rootUserId
{ "approved": true, "adminUserId": "..." }
```
Response: `{ "user": {...}, "groupCode": "ABC123" }`

**ROOT - 사용자 생성**
```bash
POST /api/auth/users
{ "username": "user1", "password": "password123", "rootUserId": "..." }
```

**ROOT - 사용자 목록**
```bash
GET /api/auth/users/:rootUserId
```

**ROOT - 사용자 수정**
```bash
PATCH /api/auth/users/:userId
{ "username": "newUsername", "password": "newPassword", "rootUserId": "..." }
# username, password 모두 선택사항
```

**ROOT - 사용자 삭제**
```bash
DELETE /api/auth/users/:userId
{ "rootUserId": "..." }
```

### 그룹 (groups)
- `GET /api/groups/my-group/:rootUserId` - Root의 그룹 정보
- `GET /api/groups/user-group/:userId` - 사용자의 그룹 정보

## ⚙️ 환경 설정

### .env 파일 (apps/server/.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://workwork:workwork123@localhost:5432/workwork?schema=public"
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### Config 구조 (apps/server/config/)
- `app.config.ts` - 앱 설정 (포트, 환경, CORS)
- `database.config.ts` - DB 연결
- `jwt.config.ts` - JWT 인증

## 📦 주요 의존성

### Server
- @nestjs/core, @nestjs/common, @nestjs/jwt
- @prisma/client, pg
- bcrypt, class-validator, class-transformer

### Browser
- react, react-dom
- vite

## 🛠️ 유용한 명령어

### Docker
```bash
docker-compose up -d        # 시작
docker-compose down         # 중지
docker-compose down -v      # 완전 초기화
```

### Prisma
```bash
npm run prisma:generate     # Client 생성
npm run prisma:push         # 스키마 푸시
npm run prisma:seed         # ADMIN 계정 생성
npm run prisma:studio       # DB GUI
```

### 개발
```bash
npm run server:dev          # 서버 개발 모드
npm run browser:dev         # 브라우저 개발 모드
npm run server:build        # 서버 빌드
npm run browser:build       # 브라우저 빌드
```

## 📝 개발 현황

### ✅ 완료
- [x] Monorepo 구조 설정
- [x] Docker PostgreSQL 설정
- [x] Prisma 스키마 정의 (ADMIN/ROOT/USER 구조)
- [x] Config 폴더 구조
- [x] ADMIN 계정 시드
- [x] Root 회원가입 (ADMIN 승인 필요)
- [x] 간소화된 로그인 (이메일 + 비밀번호만)
- [x] 상태별 UI (PENDING, APPROVED, REJECTED)
- [x] ADMIN이 Root 승인 (그룹 자동 생성)
- [x] Root가 사용자 생성/수정/삭제
- [x] 브라우저 UI (ADMIN/ROOT/USER 대시보드)
- [x] 탭별 독립 세션 (sessionStorage)

### 🚧 예정
- [ ] 이메일 알림 시스템
- [ ] Todo CRUD 구현
- [ ] WebSocket 실시간 알림
- [ ] 1시간 알림 기능
- [ ] JWT Guard 추가
- [ ] 에러 핸들링 개선

## 🔍 핵심 특징

### 3단계 권한 구조
1. **ADMIN** (1명): DB 시드로 생성, Root 승인
2. **ROOT** (다수): 회원가입 후 ADMIN 승인, 그룹 소유
3. **USER** (다수): Root가 생성, 그룹 멤버

### 간소화된 로그인
- **그룹 코드 불필요**: 이메일 + 비밀번호만
- **상태별 접근 제어**: 
  - PENDING: 로그인 가능, 기능 제한
  - APPROVED: 모든 기능 사용
  - REJECTED: 로그인 가능, 거절 메시지 표시

### 보안
- 환경변수 분리 (.env)
- 비밀번호 해싱 (bcrypt)
- JWT 토큰 기반 인증
- 그룹별 접근 제어
- ADMIN 계정은 코드로 회원가입 불가

### 데이터베이스 제약
- `@@unique([username, groupId])`: 같은 그룹 내에서만 username 유일
- ADMIN은 groupId null
- ROOT는 승인 후 그룹 자동 생성 및 groupId 설정
- USER는 생성 시 즉시 APPROVED

## 📖 사용 시나리오

### 1. ADMIN 계정 생성 (최초 1회)
```bash
cd apps/server
npm run prisma:seed
```
생성된 계정: `admin@workwork.com / admin123`

### 2. Root 회원가입
```
이메일: root@example.com
사용자명: root
비밀번호: password123
→ 상태: PENDING
```

### 3. Root 로그인 (승인 전에도 가능)
```
이메일: root@example.com
비밀번호: password123
→ "승인 대기 중입니다" 메시지 표시
→ 기능 사용 제한
```

### 4. ADMIN이 Root 승인
```
1. ADMIN 로그인 (admin@workwork.com / admin123)
2. 승인 대기 Root 목록 조회
3. 승인 버튼 클릭
→ 그룹 자동 생성 및 그룹 코드 발급 (예: ABC123)
→ Root 상태: APPROVED
```

### 5. Root 다시 로그인 또는 새로고침
```
→ "환영합니다" 메시지
→ 모든 기능 사용 가능
→ 그룹 코드 표시
```

### 6. Root가 사용자 생성
```
username: user1
비밀번호: password123
→ Root의 그룹에 자동 소속
```

### 7. 사용자 로그인
```
이메일: user1@ABC123.local (자동 생성됨)
비밀번호: password123
→ 그룹 기능 사용 가능
```

## 💡 주요 개선사항

### Before (복잡함)
- 회원가입 → 승인 → **그룹 코드 받기** → 로그인 (이메일 + 비밀번호 + **그룹 코드**)

### After (간단함)
- 회원가입 → **즉시 로그인 가능** (이메일 + 비밀번호)
- 승인 전: 대기 메시지 표시
- 승인 후: 자동으로 기능 활성화

---

**마지막 업데이트**: 2026-01-17
