# Docker 환경 설정 가이드

## 📦 포함된 서비스

- **PostgreSQL (개발용)**: 포트 5432
- **PostgreSQL (테스트용)**: 포트 5433
- **Redis**: 포트 6379 (추후 알림/캐시용)

## 🚀 빠른 시작

### 1. Docker Compose 실행

```bash
# 컨테이너 시작
docker-compose up -d

# 또는 Makefile 사용
make docker-up
```

### 2. 컨테이너 상태 확인

```bash
docker-compose ps
```

**예상 출력:**
```
NAME                      STATUS    PORTS
workwork-postgres         Up        0.0.0.0:5432->5432/tcp
workwork-postgres-test    Up        0.0.0.0:5433->5432/tcp
workwork-redis            Up        0.0.0.0:6379->6379/tcp
```

### 3. 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f postgres
```

## 🗄️ 데이터베이스 접속

### PostgreSQL (개발용)

```bash
# Docker 컨테이너 접속
docker exec -it workwork-postgres psql -U postgres -d workwork

# 또는 Makefile 사용
make db-connect

# 로컬에서 직접 접속 (psql 설치 필요)
psql -h localhost -p 5432 -U postgres -d workwork
```

### PostgreSQL (테스트용)

```bash
# Docker 컨테이너 접속
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test

# 또는 Makefile 사용
make db-test-connect

# 로컬에서 직접 접속
psql -h localhost -p 5433 -U postgres -d workwork_test
```

### Redis

```bash
# Redis CLI 접속
docker exec -it workwork-redis redis-cli

# 연결 테스트
> PING
PONG
```

## 🔧 유용한 명령어

### 컨테이너 관리

```bash
# 시작
docker-compose up -d
make docker-up

# 중지
docker-compose down
make docker-down

# 재시작
docker-compose restart
make docker-restart

# 볼륨 포함 완전 삭제 (데이터 초기화)
docker-compose down -v
make docker-clean
```

### 데이터베이스 초기화

```bash
# 개발 DB 초기화
make db-reset

# 또는 수동으로
docker-compose down -v
docker-compose up -d
```

## 📊 데이터베이스 기본 정보

### 개발용 PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: workwork

### 테스트용 PostgreSQL
- **Host**: localhost
- **Port**: 5433
- **User**: postgres
- **Password**: postgres
- **Database**: workwork_test

### Redis
- **Host**: localhost
- **Port**: 6379
- **Password**: (없음)

## 🔍 트러블슈팅

### 포트 충돌

기존에 PostgreSQL이나 Redis가 실행 중이면 포트 충돌이 발생합니다.

**해결 방법 1: 기존 서비스 중지**
```bash
# macOS (Homebrew PostgreSQL)
brew services stop postgresql

# Linux (systemd)
sudo systemctl stop postgresql
```

**해결 방법 2: docker-compose.yml 포트 변경**
```yaml
services:
  postgres:
    ports:
      - '5434:5432'  # 5432 → 5434로 변경
```

### 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs

# 컨테이너 상태 확인
docker-compose ps

# 완전 재시작
docker-compose down -v
docker-compose up -d
```

### 데이터베이스 연결 실패

1. **컨테이너 Health Check 확인**
   ```bash
   docker-compose ps
   ```
   모든 서비스가 `Up (healthy)` 상태여야 합니다.

2. **네트워크 확인**
   ```bash
   docker network ls
   docker network inspect workwork_default
   ```

3. **방화벽 확인**
   - macOS/Linux: Docker Desktop이 실행 중인지 확인

## 💾 데이터 영속성

Docker 볼륨을 사용하여 데이터를 영구 저장합니다:

```bash
# 볼륨 목록 확인
docker volume ls

# 볼륨 상세 정보
docker volume inspect workwork_postgres_data

# 볼륨 삭제 (주의: 모든 데이터 삭제)
docker volume rm workwork_postgres_data
```

## 🔐 프로덕션 환경

프로덕션에서는 다음 사항을 변경하세요:

1. **강력한 비밀번호 설정**
   ```yaml
   environment:
     POSTGRES_PASSWORD: your-strong-password-here
   ```

2. **외부 접근 차단**
   ```yaml
   ports:
     - '127.0.0.1:5432:5432'  # localhost만 접근 가능
   ```

3. **볼륨 백업 설정**
   ```bash
   # 데이터베이스 백업
   docker exec workwork-postgres pg_dump -U postgres workwork > backup.sql
   
   # 복원
   docker exec -i workwork-postgres psql -U postgres workwork < backup.sql
   ```

## 📚 추가 자료

- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Redis 공식 문서](https://redis.io/documentation)

