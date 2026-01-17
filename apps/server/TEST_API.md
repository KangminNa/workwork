# API 테스트 가이드

## 새로운 로그인 플로우

**주요 변경사항**: 그룹 코드 불필요! 이메일 + 비밀번호만으로 로그인 가능

---

## 테스트 시나리오

### 1. ADMIN 로그인

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@workwork.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@workwork.com",
    "username": "admin",
    "role": "ADMIN",
    "status": "APPROVED",
    "groupId": null
  }
}
```

---

### 2. Root 회원가입

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@example.com",
    "username": "root",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "id": "...",
  "email": "root@example.com",
  "username": "root",
  "role": "ROOT",
  "status": "PENDING",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 3. Root 로그인 (승인 전)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "PENDING",  // 승인 대기 상태
    "groupId": null
  }
}
```

**🔹 클라이언트에서 `status: "PENDING"` 체크하여 승인 대기 화면 표시**

---

### 4. ADMIN이 Root 승인 대기 목록 조회

```bash
# ADMIN_ID는 로그인 시 받은 user.id
curl -X GET http://localhost:3000/api/auth/pending-roots/ADMIN_ID \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Response:**
```json
[
  {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### 5. ADMIN이 Root 승인

```bash
curl -X PATCH http://localhost:3000/api/auth/approve-root/ROOT_USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "approved": true,
    "adminUserId": "ADMIN_ID"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "APPROVED",  // 승인됨!
    "groupId": "..."
  },
  "groupCode": "A1B2C3"  // 자동 생성된 그룹 코드
}
```

---

### 6. Root 다시 로그인 (승인 후)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "APPROVED",  // 승인됨!
    "groupId": "..."
  },
  "groupCode": "A1B2C3"  // 그룹 코드 포함
}
```

**🔹 클라이언트에서 `status: "APPROVED"` 체크하여 모든 기능 활성화**

---

### 7. Root가 사용자 생성

```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN" \
  -d '{
    "username": "user1",
    "password": "password123",
    "rootUserId": "ROOT_USER_ID"
  }'
```

**Response:**
```json
{
  "id": "...",
  "email": "user1@A1B2C3.local",  // 자동 생성된 이메일
  "username": "user1",
  "role": "USER",
  "status": "APPROVED",
  "groupId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 8. 생성된 사용자로 로그인

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@A1B2C3.local",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "user1@A1B2C3.local",
    "username": "user1",
    "role": "USER",
    "status": "APPROVED",
    "groupId": "..."
  },
  "groupCode": "A1B2C3"
}
```

---

### 9. Root의 그룹 사용자 목록 조회

```bash
curl -X GET http://localhost:3000/api/auth/users/ROOT_USER_ID \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN"
```

**Response:**
```json
[
  {
    "id": "...",
    "email": "root@example.com",
    "username": "root",
    "role": "ROOT",
    "status": "APPROVED",
    "groupId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  {
    "id": "...",
    "email": "user1@A1B2C3.local",
    "username": "user1",
    "role": "USER",
    "status": "APPROVED",
    "groupId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### 10. 사용자 수정 (Root만)

```bash
# username과 password 모두 선택사항
# 하나만 수정하거나 둘 다 수정 가능
curl -X PATCH http://localhost:3000/api/auth/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN" \
  -d '{
    "username": "newUsername",
    "password": "newPassword123",
    "rootUserId": "ROOT_USER_ID"
  }'
```

**Response:**
```json
{
  "id": "...",
  "email": "newUsername@A1B2C3.local",
  "username": "newUsername",
  "role": "USER",
  "status": "APPROVED",
  "groupId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**예시: username만 수정**
```bash
curl -X PATCH http://localhost:3000/api/auth/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN" \
  -d '{
    "username": "newUsername",
    "rootUserId": "ROOT_USER_ID"
  }'
```

**예시: password만 수정**
```bash
curl -X PATCH http://localhost:3000/api/auth/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN" \
  -d '{
    "password": "newPassword123",
    "rootUserId": "ROOT_USER_ID"
  }'
```

---

### 11. 사용자 삭제 (Root만)

```bash
curl -X DELETE http://localhost:3000/api/auth/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROOT_ACCESS_TOKEN" \
  -d '{
    "rootUserId": "ROOT_USER_ID"
  }'
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 전체 플로우 (bash 스크립트)

```bash
#!/bin/bash

# 1. ADMIN 로그인
echo "1. ADMIN 로그인..."
ADMIN_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workwork.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.accessToken')
ADMIN_ID=$(echo $ADMIN_LOGIN | jq -r '.user.id')
echo "ADMIN Token: $ADMIN_TOKEN"
echo ""

# 2. Root 회원가입
echo "2. Root 회원가입..."
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"root@test.com","username":"testroot","password":"password123"}'
echo ""

# 3. Root 로그인 (승인 전)
echo "3. Root 로그인 (승인 전)..."
ROOT_LOGIN_PENDING=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@test.com","password":"password123"}')
echo $ROOT_LOGIN_PENDING | jq
echo ""

# 4. 승인 대기 Root 목록
echo "4. 승인 대기 Root 목록..."
PENDING=$(curl -s -X GET http://localhost:3000/api/auth/pending-roots/$ADMIN_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN")
ROOT_ID=$(echo $PENDING | jq -r '.[0].id')
echo "ROOT ID: $ROOT_ID"
echo ""

# 5. Root 승인
echo "5. Root 승인..."
APPROVAL=$(curl -s -X PATCH http://localhost:3000/api/auth/approve-root/$ROOT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"approved\":true,\"adminUserId\":\"$ADMIN_ID\"}")
GROUP_CODE=$(echo $APPROVAL | jq -r '.groupCode')
echo "그룹 코드: $GROUP_CODE"
echo ""

# 6. Root 로그인 (승인 후)
echo "6. Root 로그인 (승인 후)..."
ROOT_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@test.com","password":"password123"}')
ROOT_TOKEN=$(echo $ROOT_LOGIN | jq -r '.accessToken')
echo $ROOT_LOGIN | jq
echo ""

# 7. 사용자 생성
echo "7. 사용자 생성..."
USER_CREATE=$(curl -s -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ROOT_TOKEN" \
  -d "{\"username\":\"user1\",\"password\":\"password123\",\"rootUserId\":\"$ROOT_ID\"}")
USER_ID=$(echo $USER_CREATE | jq -r '.id')
echo $USER_CREATE | jq
echo ""

# 8. 사용자 목록 조회
echo "8. 사용자 목록 조회..."
curl -X GET http://localhost:3000/api/auth/users/$ROOT_ID \
  -H "Authorization: Bearer $ROOT_TOKEN"
echo ""

# 9. 사용자 수정 (username 변경)
echo "9. 사용자 수정..."
curl -X PATCH http://localhost:3000/api/auth/users/$USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ROOT_TOKEN" \
  -d "{\"username\":\"modifiedUser\",\"rootUserId\":\"$ROOT_ID\"}"
echo ""
```

---

## 주요 변경사항 요약

### ✅ 개선된 점

1. **로그인 간소화**
   - Before: 이메일 + 비밀번호 + 그룹 코드
   - After: 이메일 + 비밀번호만

2. **승인 전에도 로그인 가능**
   - PENDING 상태에서도 로그인 허용
   - 클라이언트에서 `status` 필드로 상태 확인
   - 상태별 UI 표시

3. **사용자 경험 개선**
   - 그룹 코드 찾아서 입력할 필요 없음
   - 승인 대기 중에도 로그인하여 상태 확인 가능
   - 승인 후 자동으로 기능 활성화

---

**테스트 완료!** 🎉
