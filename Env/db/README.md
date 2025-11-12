# Database Setup Guide

## 📦 구조

```
Env/db/
├── postgres/
│   ├── docker-compose.yml    # PostgreSQL Docker 설정
│   ├── init.sql              # 초기화 스크립트
│   └── env.example           # 환경 변수 예시
├── redis/
│   ├── docker-compose.yml    # Redis Docker 설정
│   └── env.example           # 환경 변수 예시
├── prisma/
│   └── schema.prisma         # Prisma 스키마
└── README.md
```

## 🚀 빠른 시작

### 1. PostgreSQL 실행

```bash
cd Env/db/postgres
docker-compose up -d
```

**확인:**
```bash
docker-compose ps
docker-compose logs
```

**접속 테스트:**
```bash
docker exec -it workwork-postgres psql -U workwork -d workwork_db
```

### 2. Redis 실행

```bash
cd Env/db/redis
docker-compose up -d
```

**확인:**
```bash
docker-compose ps
docker exec -it workwork-redis redis-cli -a workwork123 ping
```

### 3. Prisma 설정

#### 3.1 환경 변수 설정

```bash
# server/.env 파일 생성
cd ../../../server
echo 'DATABASE_URL="postgresql://workwork:workwork123@localhost:5432/workwork_db?schema=public"' > .env
```

#### 3.2 Prisma 마이그레이션

```bash
# Prisma Client 생성
npx prisma generate --schema=../Env/db/prisma/schema.prisma

# 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init --schema=../Env/db/prisma/schema.prisma

# Prisma Studio 실행 (데이터 확인 GUI)
npx prisma studio --schema=../Env/db/prisma/schema.prisma
```

## 📊 연결 정보

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

## 🔧 유용한 명령어

### PostgreSQL

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 데이터까지 삭제
docker-compose down -v

# 로그 확인
docker-compose logs -f

# PostgreSQL 접속
docker exec -it workwork-postgres psql -U workwork -d workwork_db

# SQL 실행
docker exec -it workwork-postgres psql -U workwork -d workwork_db -c "SELECT * FROM users;"
```

### Redis

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# Redis CLI 접속
docker exec -it workwork-redis redis-cli -a workwork123

# 키 확인
docker exec -it workwork-redis redis-cli -a workwork123 KEYS '*'
```

### Prisma

```bash
# Schema 파일 위치 지정
--schema=../Env/db/prisma/schema.prisma

# Prisma Client 재생성
npx prisma generate --schema=../Env/db/prisma/schema.prisma

# 마이그레이션 생성
npx prisma migrate dev --name <migration_name> --schema=../Env/db/prisma/schema.prisma

# 마이그레이션 적용 (프로덕션)
npx prisma migrate deploy --schema=../Env/db/prisma/schema.prisma

# 데이터베이스 리셋 (주의!)
npx prisma migrate reset --schema=../Env/db/prisma/schema.prisma

# Prisma Studio 실행
npx prisma studio --schema=../Env/db/prisma/schema.prisma
```

## 📝 스키마 변경 방법

### 1. schema.prisma 수정

```prisma
model Board {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  content   String   @db.Text
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("boards")
}

model User {
  id     Int     @id @default(autoincrement())
  boards Board[]
  // ... 기존 필드
}
```

### 2. 마이그레이션 생성 및 적용

```bash
npx prisma migrate dev --name add_board_model --schema=../Env/db/prisma/schema.prisma
```

### 3. Prisma Client 재생성 (자동)

마이그레이션 시 자동으로 Prisma Client가 재생성됩니다.

## 🐛 문제 해결

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :5432
lsof -i :6379

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 초기화

```bash
# PostgreSQL
cd Env/db/postgres
docker-compose down -v
docker-compose up -d

# Prisma 마이그레이션 재실행
cd ../../../server
npx prisma migrate reset --schema=../Env/db/prisma/schema.prisma
```

### Prisma Client 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# Prisma Client 재생성
npx prisma generate --schema=../Env/db/prisma/schema.prisma
```

## 🔐 프로덕션 설정

프로덕션 환경에서는 환경 변수를 안전하게 관리해야 합니다:

```bash
# .env 파일 (절대 git에 커밋하지 않기!)
DATABASE_URL="postgresql://prod_user:strong_password@db.example.com:5432/prod_db?schema=public"
REDIS_URL="redis://:strong_password@redis.example.com:6379"
```

## 📚 참고 자료

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

