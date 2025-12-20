# 🎯 DB 데이터 유지 - 진짜 해결책

## 🔴 문제 원인

Jest 테스트는 다음 순서로 실행됩니다:
1. `beforeAll` - 초기화
2. `it` 테스트들 - 데이터 생성
3. `afterEach` - 각 테스트 후 정리 (우리는 skip)
4. `afterAll` - 최종 정리 (여기서 무한 대기)
5. **프로세스 종료** - 하지만 백그라운드나 kill 시 바로 종료됨

**문제**: `afterAll`에서 무한 대기를 해도, 프로세스를 강제 종료하면 DB 연결이 끊어지면서 데이터가 사라집니다.

## ✅ 해결책 1: 직접 실행 + 다른 터미널에서 확인

### 터미널 1: 테스트 실행 (무한 대기)
```bash
cd server
npm run test:e2e:keep -- keep-server-running
```

이 명령은 테스트 완료 후 **무한 대기** 상태가 됩니다.

### 터미널 2: DB 확인 (테스트 실행 중)
```bash
# 사용자 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT id, email, name, role FROM users ORDER BY id DESC LIMIT 10;"

# 워크스페이스 확인
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  'SELECT id, name, "inviteCode", "ownerId" FROM workspaces ORDER BY id DESC LIMIT 10;'

# 전체 개수
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM workspaces) as workspaces;"
```

### 터미널 1: 확인 완료 후 종료
```bash
# Ctrl+C 눌러서 종료
```

## ✅ 해결책 2: 테스트에 긴 대기 시간 추가

```typescript
it('데이터 생성 후 확인', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      name: '테스트',
    });

  console.log('✅ 사용자 생성:', response.body.user.id);
  console.log('');
  console.log('⏸️  60초 대기 - 지금 다른 터미널에서 DB를 확인하세요!');
  console.log('   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"');
  console.log('');

  // 60초 대기
  await new Promise(resolve => setTimeout(resolve, 60000));
});
```

## ✅ 해결책 3: 가장 확실한 방법 - 수동 스크립트

```typescript
// test/e2e/manual/create-test-data.e2e-spec.ts
describe('수동 테스트 데이터 생성', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppHelper.initialize();
    TestAppHelper.setSkipCleanup(true);
  });

  afterAll(async () => {
    console.log('');
    console.log('⚠️  cleanup()을 호출하지 않습니다 - 데이터 영구 보존');
    console.log('');
    
    // cleanup 호출 안 함!
    // await TestAppHelper.cleanup();
    
    // 앱만 종료
    if (app) {
      await app.close();
    }
  });

  it('테스트 데이터 생성', async () => {
    // 데이터 생성
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'manual@example.com',
        password: 'password123',
        name: '수동테스트',
      });
  });
});
```

**중요**: 이 방법은 `cleanup()`을 호출하지 않으므로 데이터가 영구 보존됩니다!

## 🎯 실전 가이드

### Step 1: 테스트 실행
```bash
cd server
npm run test:e2e:keep -- keep-server-running
```

출력:
```
✅ Owner 생성 완료:
   User ID: 1
   Email: owner@example.com
   Workspace ID: 1
   Invite Code: WORK-ABC123

✅ Member 생성 완료:
   Owner ID: 2
   Member ID: 3
   Workspace ID: 2
   Invite Code: WORK-XYZ789

✅ 10명의 사용자 생성 완료
   User IDs: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

═══════════════════════════════════════════════════════
🎉 테스트 완료! 서버를 계속 실행합니다...
═══════════════════════════════════════════════════════

📊 DB 데이터 확인 방법:
   docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"

═══════════════════════════════════════════════════════
🛑 종료하려면 Ctrl+C를 누르세요
═══════════════════════════════════════════════════════

(여기서 무한 대기 중...)
```

### Step 2: 다른 터미널 열기
```bash
# 새 터미널 열기
cd /Users/kangmin/Desktop/01_project/01_monorepo/workwork
```

### Step 3: DB 확인
```bash
# 사용자 목록
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT id, email, name, role FROM users ORDER BY id;"
```

출력 예시:
```
 id |        email         |    name     | role  
----+----------------------+-------------+-------
  1 | owner@example.com    | Owner사용자 | owner
  2 | random123@test.com   | Team Owner  | owner
  3 | member@example.com   | Member사용자| member
  4 | user1@example.com    | 사용자1     | owner
  5 | user2@example.com    | 사용자2     | owner
  ...
```

### Step 4: 더 자세한 확인
```bash
# 워크스페이스별 사용자 수
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
  "SELECT 
    w.id, 
    w.name, 
    w.\"inviteCode\", 
    COUNT(u.id) as member_count
   FROM workspaces w
   LEFT JOIN users u ON w.id = u.\"workspaceId\"
   GROUP BY w.id, w.name, w.\"inviteCode\"
   ORDER BY w.id;"
```

### Step 5: 테스트 종료
```bash
# 터미널 1로 돌아가서
Ctrl+C
```

## 🚀 빠른 실행

```bash
# 터미널 1
cd /Users/kangmin/Desktop/01_project/01_monorepo/workwork/server
npm run test:e2e:keep -- keep-server-running

# 터미널 2 (테스트가 "무한 대기" 메시지를 출력한 후)
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT * FROM users;"

# 터미널 1에서 Ctrl+C로 종료
```

## 💡 왜 이전에는 데이터가 없었나?

1. **백그라운드 실행**: `&`로 실행하면 프로세스가 백그라운드로 가고, `kill`하면 즉시 종료됨
2. **cleanup() 호출**: `afterAll`에서 `cleanup()`이 호출되면 DB가 정리됨
3. **타이밍 문제**: 테스트가 완료되고 DB를 확인하기 전에 정리가 완료됨

## ✅ 올바른 순서

1. 테스트 실행 (포그라운드)
2. 테스트 완료 후 **무한 대기** 진입
3. **다른 터미널**에서 DB 확인
4. 확인 완료 후 **Ctrl+C**로 종료

이 방법이 **100% 확실**하게 데이터를 확인할 수 있습니다!

## 🔍 실시간 모니터링 스크립트

```bash
# scripts/watch-test-db.sh
#!/bin/bash
while true; do
  clear
  echo "=== 테스트 DB 실시간 모니터링 ==="
  echo "$(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  
  docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
    "SELECT COUNT(*) as users FROM users;"
  
  docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
    "SELECT id, email, name, role FROM users ORDER BY id DESC LIMIT 5;"
  
  echo ""
  echo "Ctrl+C로 종료"
  sleep 2
done
```

실행:
```bash
chmod +x scripts/watch-test-db.sh

# 터미널 1: 테스트
npm run test:e2e:keep -- keep-server-running

# 터미널 2: 모니터링
./scripts/watch-test-db.sh
```

이제 **실시간으로** 데이터가 생성되는 것을 볼 수 있습니다!

