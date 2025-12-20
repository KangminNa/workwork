# 🎯 DB 데이터 유지 - 간단 가이드

## ⚠️ 중요: 현재 상황

Jest 테스트는 `afterAll`이 완료된 후에 프로세스가 종료되면서 모든 연결이 정리됩니다.
따라서 **테스트 완료 후 즉시 DB를 확인**해야 합니다.

## 🎯 실전 방법

### 방법 1: 테스트 실행 중 다른 터미널에서 확인

#### 터미널 1: 테스트 실행 (느리게)
```bash
cd server
npm run test:e2e:keep -- register-permanent-data
```

#### 터미널 2: 실시간 DB 모니터링
```bash
# 1초마다 사용자 수 확인
watch -n 1 'docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT COUNT(*) FROM users;"'
```

#### 터미널 3: 데이터 확인
```bash
# 테스트 실행 중에 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"
```

### 방법 2: 테스트에 디버거 중단점 추가

```typescript
it('테스트', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send(registerDto);

  console.log('✅ 사용자 생성:', response.body.user.id);
  
  // 여기서 중단점 설정!
  debugger; // 또는 VS Code 중단점
  
  // 중단된 상태에서 다른 터미널로 DB 확인
});
```

실행:
```bash
npm run test:debug -- register-permanent-data
```

### 방법 3: 테스트에 대기 시간 추가

```typescript
it('테스트', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send(registerDto);

  console.log('✅ 사용자 생성:', response.body.user.id);
  console.log('⏸️  30초 대기 - 지금 DB를 확인하세요!');
  console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"');
  
  // 30초 대기
  await new Promise(resolve => setTimeout(resolve, 30000));
});
```

### 방법 4: 가장 간단한 방법 - 테스트 서버 유지

```typescript
// test/e2e/auth/keep-server-running.e2e-spec.ts
describe('서버 유지 테스트', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true);
  });

  afterAll(async () => {
    console.log('');
    console.log('⏸️  서버를 계속 실행합니다...');
    console.log('📊 DB 확인: docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"');
    console.log('🛑 종료하려면 Ctrl+C를 누르세요');
    console.log('');
    
    // 무한 대기 (사용자가 Ctrl+C로 종료할 때까지)
    await new Promise(() => {}); // 영원히 대기
  });

  it('데이터 생성', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      });
  });
});
```

실행:
```bash
npm run test:e2e:keep -- keep-server-running

# 다른 터미널에서
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"

# 확인 후 Ctrl+C로 종료
```

## 🔍 실시간 확인 스크립트

### 스크립트 생성
```bash
# scripts/watch-test-db.sh
#!/bin/bash

echo "🔍 테스트 DB 실시간 모니터링"
echo "Ctrl+C로 종료"
echo ""

while true; do
  clear
  echo "=== 사용자 테이블 ==="
  docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
    "SELECT id, email, name, role FROM users ORDER BY id DESC LIMIT 10;"
  
  echo ""
  echo "=== 워크스페이스 테이블 ==="
  docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
    "SELECT id, name, \"inviteCode\", \"ownerId\" FROM workspaces ORDER BY id DESC LIMIT 10;"
  
  echo ""
  echo "$(date '+%Y-%m-%d %H:%M:%S') - 1초 후 갱신..."
  sleep 1
done
```

### 실행
```bash
chmod +x scripts/watch-test-db.sh

# 터미널 1: 모니터링
./scripts/watch-test-db.sh

# 터미널 2: 테스트
npm run test:e2e:keep
```

## 💡 추천 방법

### 개발 중 디버깅
```typescript
describe('디버깅', () => {
  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true);
  });

  it('문제 재현', async () => {
    // 문제가 발생하는 코드
    const result = await someOperation();
    
    // 여기서 중단점 또는 긴 대기
    await new Promise(resolve => setTimeout(resolve, 60000)); // 1분 대기
    
    expect(result).toBeDefined();
  });
});
```

실행 후 다른 터미널에서 DB 확인:
```bash
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test
```

## 📊 DB 확인 명령어 모음

```bash
# 전체 데이터 개수
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM workspaces) as workspaces;"

# 최근 생성된 데이터
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT id, email, name, role, created_at 
   FROM users 
   ORDER BY created_at DESC 
   LIMIT 5;"

# 워크스페이스별 사용자 수
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT 
    w.id, 
    w.name, 
    w.\"inviteCode\", 
    COUNT(u.id) as member_count
   FROM workspaces w
   LEFT JOIN users u ON w.id = u.\"workspaceId\"
   GROUP BY w.id, w.name, w.\"inviteCode\";"

# 특정 이메일 검색
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT * FROM users WHERE email LIKE '%permanent%';"
```

## 🎯 결론

**Jest 테스트의 특성상 `afterAll` 이후에는 DB 연결이 끊어집니다.**

따라서:
1. ✅ **테스트 실행 중**에 다른 터미널에서 DB 확인
2. ✅ 테스트에 **긴 대기 시간** 추가
3. ✅ **디버거 중단점** 사용
4. ✅ **무한 대기** 테스트 작성 (Ctrl+C로 수동 종료)

이 중 **4번 방법(무한 대기)**이 가장 확실합니다!

## 🚀 빠른 시작

```bash
# 1. 무한 대기 테스트 실행
npm run test:e2e:keep -- keep-server-running

# 2. 다른 터미널에서 DB 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test
workwork_test=# SELECT * FROM users;
workwork_test=# \q

# 3. 확인 완료 후 Ctrl+C로 종료
```

이 방법이 가장 확실하게 데이터를 확인할 수 있습니다!

