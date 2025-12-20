# 🔍 테스트 DB 데이터 검증 가이드

## 테스트 중 실제 DB에 데이터가 저장되는지 확인하는 방법

### 1. 테스트 실행 중 DB 데이터 확인

테스트가 실행되는 동안 또는 실행 직후에 DB를 확인할 수 있습니다.

#### 방법 1: Docker로 직접 접속

```bash
# 테스트 DB 접속
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test

# 테이블 목록 확인
\dt

# 사용자 데이터 확인
SELECT * FROM users;

# 워크스페이스 데이터 확인
SELECT * FROM workspaces;

# 데이터 개수 확인
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM workspaces;

# 종료
\q
```

#### 방법 2: 명령어로 빠르게 확인

```bash
# 사용자 수 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT COUNT(*) FROM users;"

# 워크스페이스 수 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT COUNT(*) FROM workspaces;"

# 최근 생성된 사용자 확인
docker exec -it workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### 2. 테스트 중 데이터 확인 (디버깅용)

테스트 코드에 일시적으로 로그를 추가하여 확인할 수 있습니다:

```typescript
it('회원가입 테스트', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({
      email: 'test@example.com',
      password: 'password123',
      name: '테스트',
    });

  // DB에 실제로 저장되었는지 확인
  console.log('Response:', response.body);
  console.log('User ID:', response.body.user.id);
  
  // 이 시점에서 DB를 확인하면 데이터가 있음!
  // 하지만 afterEach에서 cleanDatabase()가 실행되면 삭제됨
});
```

### 3. 테스트 후 데이터가 없는 이유

**중요**: 각 테스트 후 `afterEach`에서 `TestDatabaseHelper.cleanDatabase()`가 실행되어 **모든 데이터가 삭제**됩니다!

```typescript
afterEach(async () => {
  await TestAppHelper.resetDatabase(); // 여기서 모든 데이터 삭제!
});
```

따라서:
- ✅ **테스트 실행 중**: 데이터가 DB에 저장됨
- ❌ **테스트 완료 후**: 데이터가 자동으로 삭제됨

### 4. 테스트 후에도 데이터를 유지하려면

테스트 파일에서 일시적으로 `afterEach`를 주석 처리하면 됩니다:

```typescript
// afterEach(async () => {
//   await TestAppHelper.resetDatabase();
// });
```

**주의**: 이렇게 하면 다음 테스트 실행 시 데이터 충돌이 발생할 수 있습니다!

### 5. 실시간 데이터 확인 방법

#### 터미널 1: 테스트 실행 (Watch 모드)
```bash
cd server
npm run test:e2e -- --watch
```

#### 터미널 2: DB 모니터링
```bash
# 1초마다 사용자 수 확인
watch -n 1 'docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT COUNT(*) FROM users;"'
```

### 6. 데이터 흐름 확인

```
1. 테스트 시작
   ↓
2. beforeAll: DB 연결 및 초기화
   ↓
3. 테스트 실행: API 호출
   ↓
4. Controller → Service → Repository → TypeORM
   ↓
5. PostgreSQL에 데이터 저장 ✅ (여기서 확인 가능!)
   ↓
6. 테스트 검증 (expect)
   ↓
7. afterEach: cleanDatabase() 실행
   ↓
8. 모든 데이터 삭제 ❌
```

### 7. 실제 데이터 저장 확인 예제

```bash
# 1. 테스트 실행 (백그라운드)
cd server
npm run test:e2e &

# 2. 즉시 DB 확인 (테스트 실행 중)
sleep 2  # 테스트가 시작될 때까지 대기
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c "SELECT email, name, role FROM users;"

# 출력 예시:
#         email         |   name   | role  
# ----------------------+----------+-------
#  test-abc123@example.com | 홍길동   | owner
#  test-def456@example.com | 김철수   | member
# (2 rows)
```

### 8. 테스트 DB vs 개발 DB

| 구분 | 테스트 DB | 개발 DB |
|------|-----------|---------|
| 포트 | 5433 | 5432 |
| 데이터베이스명 | workwork_test | workwork |
| 컨테이너명 | workwork-postgres-test | workwork-postgres |
| 데이터 유지 | ❌ 테스트 후 삭제 | ✅ 영구 보관 |
| 용도 | 자동화 테스트 | 로컬 개발 |

### 9. 데이터 저장 검증 스크립트

프로젝트에 포함된 스크립트를 사용할 수 있습니다:

```bash
# 테스트 실행 + DB 데이터 확인
cd server
npm run test:e2e && \
docker exec workwork-postgres-test psql -U postgres -d workwork_test -c \
"SELECT 'Users: ' || COUNT(*) FROM users UNION ALL SELECT 'Workspaces: ' || COUNT(*) FROM workspaces;"
```

### 10. 결론

**테스트는 실제로 DB에 데이터를 저장합니다!** ✅

- E2E 테스트: API → DB 저장 → 검증 → 삭제
- 단위 테스트 (Repository): Repository → DB 저장 → 검증 → 삭제
- 단위 테스트 (Service Mock): DB 접근 없음 (Mock 사용)

각 테스트는 독립적으로 실행되며, 테스트 간 데이터 충돌을 방지하기 위해 `afterEach`에서 자동으로 정리됩니다.

## 📊 테스트 유형별 DB 사용 여부

| 테스트 유형 | 위치 | DB 사용 | 데이터 저장 |
|------------|------|---------|------------|
| **E2E 테스트** | `test/e2e/` | ✅ 실제 DB | ✅ 저장 후 삭제 |
| **Repository 단위 테스트** | `test/unit/repositories/` | ✅ 실제 DB | ✅ 저장 후 삭제 |
| **Service Mock 테스트** | `test/unit/services/` | ❌ Mock | ❌ 저장 안 함 |

## 🎯 추천 사용법

1. **개발 중**: E2E 테스트로 전체 플로우 검증
2. **Repository 검증**: 단위 테스트로 ORM 로직 검증
3. **Service 로직 검증**: Mock 테스트로 빠른 검증
4. **DB 데이터 확인**: 위의 방법들로 실시간 확인

