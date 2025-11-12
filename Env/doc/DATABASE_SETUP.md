# 🗄️ Database Setup Guide - PostgreSQL + Prisma ORM

## 📋 개요

이 프로젝트는 **PostgreSQL + Prisma ORM**을 사용합니다.
Repository는 Prisma를 직접 다루지 않고, `BaseRepository`를 상속받아 `modelName`만 지정하면 됩니다.

## 🏗️ 구조

```
Env/db/
├── docker-compose.yml           # 통합 Docker Compose (PostgreSQL + Redis)
├── postgres/
│   ├── docker-compose.yml       # PostgreSQL 단독 실행
│   ├── init.sql                 # 초기화 스크립트
│   └── env.example              # 환경 변수 예시
├── redis/
│   ├── docker-compose.yml       # Redis 단독 실행
│   └── env.example              # 환경 변수 예시
├── prisma/
│   └── schema.prisma            # Prisma 스키마 정의
└── README.md                    # 상세 가이드
```

## 🚀 빠른 시작

### 1. 데이터베이스 실행

#### 옵션 A: 통합 실행 (PostgreSQL + Redis 동시 실행) ✅ 추천

```bash
cd Env/db
docker-compose up -d
```

#### 옵션 B: 개별 실행

```bash
# PostgreSQL만
cd Env/db/postgres
docker-compose up -d

# Redis만
cd Env/db/redis
docker-compose up -d
```

### 2. 환경 변수 설정

```bash
# server/.env 파일 생성
cd server
cat > .env << EOF
DATABASE_URL="postgresql://workwork:workwork123@localhost:5432/workwork_db?schema=public"
REDIS_URL="redis://:workwork123@localhost:6379"
NODE_ENV=development
EOF
```

### 3. Prisma 설정

```bash
cd server

# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션 (테이블 생성)
npm run prisma:migrate

# 또는 한 번에
npm run db:setup
```

### 4. 서버 실행

```bash
npm run dev
```

## 📊 데이터베이스 연결 정보

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database:** workwork_db
- **User:** workwork
- **Password:** workwork123
- **Connection URL:** `postgresql://workwork:workwork123@localhost:5432/workwork_db`

### Redis
- **Host:** localhost
- **Port:** 6379
- **Password:** workwork123
- **Connection URL:** `redis://:workwork123@localhost:6379`

## 🔧 BaseRepository 사용법

### 기본 개념

`BaseRepository`는 Prisma를 추상화하여, 상속받는 Repository가 ORM을 신경쓰지 않도록 합니다.

### 1. Schema 정의 (Env/db/prisma/schema.prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(50)
  password  String   @db.VarChar(255)
  email     String   @unique @db.VarChar(100)
  phone     String   @unique @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### 2. Repository 작성

```typescript
import { Repository } from '@core/decorators';
import { BaseRepository } from '@core/BaseRepository';
import { User } from './entities/User';

@Repository('userRepository')
export class UserRepository extends BaseRepository<User> {
  // 1. Prisma 모델 이름만 지정! (schema.prisma의 model 이름)
  protected modelName = 'user' as const;

  // 2. BaseRepository가 제공하는 메서드들 (자동 사용 가능)
  // - findAll()
  // - findById(id)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - count(where)
  // - exists(where)

  // 3. 추가 메서드만 구현하면 됨!
  async findByUsername(username: string): Promise<User | null> {
    // this.model이 Prisma의 prisma.user를 가리킴
    return await this.model.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  async search(query: string): Promise<User[]> {
    return await this.model.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}
```

### 3. Service에서 사용

```typescript
@Service('userService')
export class UserService extends BaseService {
  constructor(
    private userRepository: UserRepository
  ) {
    super();
  }

  async register(data: CreateUserDto) {
    // BaseRepository 메서드 사용
    const existing = await this.userRepository.findByUsername(data.username);
    if (existing) throw new Error('Username already exists');

    // 생성
    const user = await this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
      phone: data.phone,
    });

    return user;
  }

  async getAllUsers() {
    // BaseRepository 메서드
    return await this.userRepository.findAll();
  }
}
```

## 🎯 BaseRepository가 제공하는 메서드

### 기본 CRUD

```typescript
// 전체 조회
await repository.findAll();

// ID로 조회
await repository.findById(1);

// 생성
await repository.create({
  username: 'john',
  email: 'john@example.com',
  // ...
});

// 수정
await repository.update(1, {
  email: 'newemail@example.com',
});

// 삭제
await repository.delete(1);
```

### 유틸리티

```typescript
// 개수 조회
await repository.count();
await repository.count({ where: { username: 'john' } });

// 존재 확인
const exists = await repository.exists({ email: 'john@example.com' });
```

### 직접 Prisma 사용 (고급)

```typescript
// this.model로 Prisma에 직접 접근
async findWithPagination(page: number, limit: number) {
  return await this.model.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

async findWithRelations(id: number) {
  return await this.model.findUnique({
    where: { id },
    include: {
      posts: true,
      comments: true,
    },
  });
}
```

## 📝 새로운 모델 추가 예시

### 예시: Board 모델

#### 1. schema.prisma에 모델 추가

```prisma
model Board {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  content   String   @db.Text
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("boards")
  @@index([userId])
}

model User {
  // ...
  boards Board[]
}
```

#### 2. 마이그레이션

```bash
npm run prisma:migrate
# 마이그레이션 이름 입력: add_board_model
```

#### 3. BoardRepository 작성

```typescript
import { Repository } from '@core/decorators';
import { BaseRepository } from '@core/BaseRepository';
import { Board } from './entities/Board';

@Repository('boardRepository')
export class BoardRepository extends BaseRepository<Board> {
  protected modelName = 'board' as const;  // 👈 이것만!

  // 추가 메서드
  async findByUserId(userId: number): Promise<Board[]> {
    return await this.model.findMany({
      where: { userId },
      include: { user: true },  // 관계 포함
    });
  }
}
```

#### 4. 끝! BaseRepository의 모든 기능 사용 가능

```typescript
// BoardService.ts
const boards = await this.boardRepository.findAll();
const board = await this.boardRepository.findById(1);
await this.boardRepository.create({ title: 'Test', content: 'Content', userId: 1 });
await this.boardRepository.update(1, { title: 'Updated' });
await this.boardRepository.delete(1);
```

## 🛠️ 유용한 명령어

### Docker

```bash
# 모두 시작
cd Env/db
docker-compose up -d

# 모두 중지
docker-compose down

# 데이터까지 삭제
docker-compose down -v

# 로그 확인
docker-compose logs -f postgres
docker-compose logs -f redis

# 상태 확인
docker-compose ps
```

### Prisma

```bash
# Client 생성
npm run prisma:generate

# 마이그레이션 (개발)
npm run prisma:migrate

# 마이그레이션 (프로덕션)
npm run prisma:migrate:deploy

# Prisma Studio (GUI)
npm run prisma:studio

# 데이터베이스 리셋 (주의!)
npm run prisma:reset

# 한 번에 설정
npm run db:setup
```

### PostgreSQL CLI

```bash
# 접속
docker exec -it workwork-postgres psql -U workwork -d workwork_db

# SQL 실행
docker exec -it workwork-postgres psql -U workwork -d workwork_db -c "SELECT * FROM users;"
```

## 🔍 Prisma Studio

Prisma Studio는 데이터를 GUI로 확인/수정할 수 있는 도구입니다.

```bash
npm run prisma:studio
```

브라우저에서 `http://localhost:5555` 열림

## 🎉 장점

### 1. Repository는 ORM을 신경쓰지 않음

```typescript
// ❌ 이전: Prisma를 직접 다룸
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.user.findMany();

// ✅ 현재: BaseRepository 상속
protected modelName = 'user';
await this.findAll();  // BaseRepository가 알아서 처리
```

### 2. 일관된 인터페이스

모든 Repository가 동일한 메서드를 제공:
- `findAll()`, `findById()`, `create()`, `update()`, `delete()`

### 3. 필요시 Prisma 직접 사용 가능

```typescript
// this.model로 Prisma에 직접 접근
await this.model.findMany({
  where: { /* 복잡한 조건 */ },
  include: { /* 관계 포함 */ },
});
```

### 4. 타입 안정성

Prisma가 TypeScript 타입을 자동 생성하므로 타입 안정성 보장

## 🐛 문제 해결

### Prisma Client 에러

```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# Prisma Client 재생성
npm run prisma:generate
```

### 마이그레이션 충돌

```bash
# 데이터베이스 리셋 (개발 환경에서만!)
npm run prisma:reset
```

### Docker 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :5432
lsof -i :6379

# 프로세스 종료
kill -9 <PID>
```

## 📚 참고

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🚀 다음 단계

- [ ] 실제 bcrypt로 비밀번호 해싱
- [ ] JWT 토큰 기반 인증
- [ ] Redis 세션 관리
- [ ] 트랜잭션 처리
- [ ] 페이지네이션
- [ ] 소프트 삭제 (soft delete)

