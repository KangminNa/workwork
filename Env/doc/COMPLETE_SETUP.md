# ✅ 완료: PostgreSQL + Prisma ORM 통합

## 📋 완료 항목

### 1. Docker 설정 ✅

#### 통합 Docker Compose
```
Env/db/docker-compose.yml
```
- PostgreSQL 16 Alpine
- Redis 7 Alpine
- 네트워크 연결
- 볼륨 마운트
- Health check

#### 개별 Docker Compose
- `Env/db/postgres/docker-compose.yml` - PostgreSQL 단독 실행
- `Env/db/redis/docker-compose.yml` - Redis 단독 실행

### 2. Prisma 설정 ✅

#### Schema 정의
```prisma
// Env/db/prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  email     String   @unique
  phone     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. BaseRepository 개선 ✅

**Before (메모리 기반):**
```typescript
export abstract class BaseRepository<T> {
  protected items: T[] = [];
  async findAll() { return this.items; }
}
```

**After (Prisma 기반):**
```typescript
export abstract class BaseRepository<T> {
  protected abstract modelName: string;  // 👈 이것만 지정!
  
  protected get model() {
    return (prisma as any)[this.modelName];
  }
  
  async findAll() {
    return await this.model.findMany();  // Prisma 자동 사용
  }
}
```

### 4. UserRepository 업데이트 ✅

```typescript
@Repository('userRepository')
export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user' as const;  // 👈 Prisma 모델 이름만!
  
  // Prisma를 직접 다루지 않아도 됨
  async findByUsername(username: string) {
    return await this.model.findUnique({ where: { username } });
  }
}
```

### 5. Prisma Scripts 추가 ✅

```json
// server/package.json
{
  "scripts": {
    "prisma:generate": "prisma generate --schema=../Env/db/prisma/schema.prisma",
    "prisma:migrate": "prisma migrate dev --schema=../Env/db/prisma/schema.prisma",
    "prisma:studio": "prisma studio --schema=../Env/db/prisma/schema.prisma",
    "db:setup": "npm run prisma:generate && npm run prisma:migrate"
  }
}
```

## 🚀 사용 방법

### 1. 데이터베이스 실행

```bash
# PostgreSQL + Redis 동시 실행
cd Env/db
docker-compose up -d

# 확인
docker-compose ps
```

### 2. 환경 변수 설정

```bash
# server/.env
echo 'DATABASE_URL="postgresql://workwork:workwork123@localhost:5432/workwork_db?schema=public"' > server/.env
```

### 3. Prisma 설정

```bash
cd server

# Prisma Client 생성 + 마이그레이션
npm run db:setup
```

### 4. 서버 실행

```bash
npm run dev
```

## 📊 파일 구조

```
workwork/
├── Env/
│   └── db/
│       ├── docker-compose.yml        # 통합 Docker (PG + Redis)
│       ├── postgres/
│       │   ├── docker-compose.yml
│       │   ├── init.sql
│       │   └── env.example
│       ├── redis/
│       │   ├── docker-compose.yml
│       │   └── env.example
│       ├── prisma/
│       │   └── schema.prisma         # Prisma 스키마
│       └── README.md
│
├── server/
│   ├── src/
│   │   ├── core/
│   │   │   ├── PrismaClient.ts       # 🆕 Prisma 싱글톤
│   │   │   └── BaseRepository.ts     # 🔧 Prisma 기반으로 개선
│   │   └── modules/
│   │       └── user/
│   │           └── UserRepository.ts # 🔧 Prisma 사용
│   ├── .env                          # DATABASE_URL
│   └── package.json                  # Prisma 스크립트
│
└── DATABASE_SETUP.md                 # 상세 가이드
```

## 🎯 핵심 변경 사항

### 1. BaseRepository가 Prisma를 추상화

**사용자가 할 일:**
```typescript
protected modelName = 'user' as const;  // 이것만!
```

**BaseRepository가 해주는 일:**
- Prisma Client 연결
- CRUD 메서드 제공
- 트랜잭션 처리 준비
- 타입 안정성

### 2. Repository는 ORM을 신경쓰지 않음

```typescript
// ❌ Prisma를 직접 import하지 않음
import { PrismaClient } from '@prisma/client';

// ✅ BaseRepository만 상속
import { BaseRepository } from '@core/BaseRepository';

@Repository('userRepository')
export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user';  // 끝!
}
```

### 3. 자동으로 제공되는 메서드

```typescript
// BaseRepository가 자동 제공
await repository.findAll();
await repository.findById(id);
await repository.create(data);
await repository.update(id, data);
await repository.delete(id);
await repository.count(where);
await repository.exists(where);

// 추가 메서드만 구현
async findByUsername(username: string) {
  return await this.model.findUnique({ where: { username } });
}
```

## 📝 API 테스트

### 1. Docker 실행 확인

```bash
docker ps
# workwork-postgres와 workwork-redis가 실행 중이어야 함
```

### 2. 회원가입

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "123456",
    "email": "john@example.com",
    "phone": "01012345678"
  }'
```

### 3. Prisma Studio로 확인

```bash
cd server
npm run prisma:studio
```

브라우저에서 `http://localhost:5555` 열어서 users 테이블 확인

### 4. PostgreSQL CLI로 확인

```bash
docker exec -it workwork-postgres psql -U workwork -d workwork_db -c "SELECT id, username, email FROM users;"
```

## 🎉 장점

### 1. ORM 추상화
```typescript
// Repository 작성 시 ORM을 신경쓰지 않음
protected modelName = 'user';  // 이것만!
```

### 2. 일관된 인터페이스
모든 Repository가 동일한 메서드 제공

### 3. 필요시 Prisma 직접 사용
```typescript
// this.model로 Prisma 직접 접근 가능
async findWithRelations(id: number) {
  return await this.model.findUnique({
    where: { id },
    include: { posts: true },
  });
}
```

### 4. 타입 안정성
Prisma가 TypeScript 타입 자동 생성

### 5. Migration 관리
Schema 변경 이력을 Git으로 관리

## 🔧 새 모델 추가 예시

### 1. schema.prisma에 추가

```prisma
model Board {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("boards")
}
```

### 2. 마이그레이션

```bash
npm run prisma:migrate
```

### 3. Repository 작성

```typescript
@Repository('boardRepository')
export class BoardRepository extends BaseRepository<Board> {
  protected modelName = 'board' as const;  // 끝!
  
  // BaseRepository의 모든 메서드 자동 사용 가능
}
```

## 📚 유용한 명령어

```bash
# Docker
cd Env/db
docker-compose up -d          # 시작
docker-compose down           # 중지
docker-compose down -v        # 데이터까지 삭제
docker-compose logs -f        # 로그

# Prisma
cd server
npm run prisma:generate       # Client 생성
npm run prisma:migrate        # 마이그레이션
npm run prisma:studio         # GUI
npm run db:setup              # 전체 설정

# PostgreSQL
docker exec -it workwork-postgres psql -U workwork -d workwork_db
\dt                           # 테이블 목록
\d users                      # users 테이블 구조
SELECT * FROM users;          # 데이터 조회
```

## 🐛 문제 해결

### Prisma Client not found

```bash
npm run prisma:generate
```

### Migration 충돌

```bash
npm run prisma:reset  # 주의: 데이터 삭제됨
```

### 포트 충돌 (5432, 6379)

```bash
lsof -i :5432
kill -9 <PID>
```

## 🚀 다음 단계

- [ ] bcrypt 비밀번호 해싱
- [ ] JWT 인증
- [ ] Redis 세션 관리
- [ ] 트랜잭션 처리
- [ ] 소프트 삭제
- [ ] 페이지네이션
- [ ] 검색 기능

---

**이제 Repository는 ORM을 신경쓰지 않고, modelName만 지정하면 모든 CRUD가 자동으로 작동합니다!** 🎉

