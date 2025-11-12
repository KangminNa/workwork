# 🏗️ 올바른 아키텍처: Repository, Service, BaseRepository

## 📋 역할 분리

### 1. **BaseRepository** - Prisma 연결 및 트랜잭션 관리

**역할:**
- Prisma Client 제공
- 어떤 DB의 어떤 테이블로 갈지 결정
- 여러 Repository 작업을 묶는 트랜잭션 제공

```typescript
export abstract class BaseRepository {
  // Prisma Client 제공
  protected get db(): PrismaClient {
    return prisma;
  }

  // 트랜잭션 관리
  async transaction<R>(fn: () => Promise<R>): Promise<R> {
    return await prisma.$transaction(async () => {
      return await fn();
    });
  }
}
```

### 2. **Repository** - 데이터 CRUD만 관심

**역할:**
- 어떤 테이블의 (users, boards, comments 등)
- 어떤 컬럼의 (username, email, title, content 등)
- 무엇을 할지만 (create, find, update, delete)

**비즈니스 로직은 없음!**

```typescript
@Repository('userRepository')
export class UserRepository extends BaseRepository {
  // 어떤 모델(테이블)을 사용할지
  protected get model() {
    return this.db.user;  // users 테이블
  }

  // CRUD 메서드 - 데이터 접근만
  async findByUsername(username: string): Promise<User | null> {
    return await this.model.findUnique({ where: { username } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return await this.model.create({ data });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number): Promise<User> {
    return await this.model.delete({ where: { id } });
  }
}
```

### 3. **Service** - 비즈니스 로직만 관심

**역할:**
- 비즈니스 규칙 (중복 체크, 유효성 검증 등)
- 여러 Repository 조합
- 트랜잭션 관리

**데이터 접근은 Repository에 위임!**

```typescript
@Service('userService')
export class UserService extends BaseService {
  constructor(
    private userRepository: UserRepository,
    private profileRepository: ProfileRepository
  ) {
    super();
  }

  // 비즈니스 로직
  async register(data: CreateUserDto) {
    // 1. 비즈니스 규칙: 중복 체크
    const existing = await this.userRepository.findByUsername(data.username);
    if (existing) {
      throw new Error('Username already exists');
    }

    // 2. 비즈니스 규칙: 유효성 검증
    if (data.password.length < 6) {
      throw new Error('Password too short');
    }

    // 3. 비즈니스 로직: 비밀번호 해싱
    const hashedPassword = this.hashPassword(data.password);

    // 4. Repository를 통한 데이터 저장
    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  // 여러 Repository를 조합하여 트랜잭션 처리
  async registerWithProfile(userData: CreateUserDto, profileData: any) {
    return await this.userRepository.transaction(async () => {
      // 1. UserRepository 사용
      const user = await this.userRepository.create(userData);
      
      // 2. ProfileRepository 사용
      const profile = await this.profileRepository.create({
        userId: user.id,
        ...profileData,
      });
      
      return { user, profile };
    });
  }
}
```

---

## 🎯 계층별 책임

```
┌─────────────────────────────────────────────────┐
│               Controller                         │
│  - HTTP/Socket/Worker 프로토콜 처리              │
│  - 요청/응답 변환                                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                Service                           │
│  ✅ 비즈니스 로직만 관심                         │
│  - 중복 체크, 유효성 검증                        │
│  - 비즈니스 규칙 적용                            │
│  - 여러 Repository 조합                          │
│  - 트랜잭션 관리                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Repository                          │
│  ✅ 데이터 CRUD만 관심                           │
│  - 어떤 테이블의                                 │
│  - 어떤 컬럼의                                   │
│  - 무엇을 할지만                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           BaseRepository                         │
│  ✅ Prisma 연결 및 트랜잭션 관리                 │
│  - Prisma Client 제공                            │
│  - 어떤 DB의 어떤 테이블로 갈지                  │
│  - 트랜잭션 메서드 제공                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            Prisma ORM                            │
│  - PostgreSQL 연결                               │
│  - SQL 쿼리 생성                                 │
└─────────────────────────────────────────────────┘
```

---

## 💡 실전 예시

### 예시 1: 단순 조회

```typescript
// ❌ 잘못된 방식 - Service에 데이터 로직
async getUserByUsername(username: string) {
  // Service에서 직접 Prisma 사용 (잘못됨!)
  return await prisma.user.findUnique({ where: { username } });
}

// ✅ 올바른 방식 - Repository가 데이터 담당
// Repository
async findByUsername(username: string) {
  return await this.model.findUnique({ where: { username } });
}

// Service
async getUserByUsername(username: string) {
  return await this.userRepository.findByUsername(username);
}
```

### 예시 2: 복잡한 비즈니스 로직

```typescript
// Service - 비즈니스 로직
async transferPoints(fromUserId: number, toUserId: number, points: number) {
  // 1. 비즈니스 규칙: 잔액 확인
  const fromUser = await this.userRepository.findById(fromUserId);
  if (fromUser.points < points) {
    throw new Error('Insufficient points');
  }

  // 2. 비즈니스 규칙: 최소 포인트
  if (points < 100) {
    throw new Error('Minimum 100 points');
  }

  // 3. 트랜잭션으로 여러 Repository 작업 묶기
  return await this.userRepository.transaction(async () => {
    await this.userRepository.decrementPoints(fromUserId, points);
    await this.userRepository.incrementPoints(toUserId, points);
    await this.pointHistoryRepository.create({
      fromUserId,
      toUserId,
      points,
      type: 'TRANSFER',
    });
  });
}

// Repository - CRUD만
async decrementPoints(userId: number, points: number) {
  return await this.model.update({
    where: { id: userId },
    data: { points: { decrement: points } },
  });
}

async incrementPoints(userId: number, points: number) {
  return await this.model.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });
}
```

### 예시 3: 여러 Repository 조합

```typescript
// Service
async createPost(userId: number, postData: CreatePostDto) {
  // 1. 비즈니스 규칙: 사용자 존재 확인
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 2. 비즈니스 규칙: 하루 포스팅 제한
  const todayPostCount = await this.postRepository.countByUserIdToday(userId);
  if (todayPostCount >= 10) {
    throw new Error('Daily post limit exceeded');
  }

  // 3. 트랜잭션: 게시글 생성 + 포인트 지급
  return await this.userRepository.transaction(async () => {
    // PostRepository 사용
    const post = await this.postRepository.create({
      ...postData,
      userId,
    });

    // UserRepository 사용
    await this.userRepository.incrementPoints(userId, 10);

    // PointHistoryRepository 사용
    await this.pointHistoryRepository.create({
      userId,
      points: 10,
      reason: 'POST_CREATED',
    });

    return post;
  });
}
```

---

## 📊 비교표

| 계층 | 관심사 | 예시 |
|------|--------|------|
| **Service** | 비즈니스 로직 | 중복 체크, 유효성 검증, 규칙 적용, 여러 Repository 조합 |
| **Repository** | 데이터 CRUD | findByUsername, create, update, delete, search |
| **BaseRepository** | ORM 연결 & 트랜잭션 | Prisma Client 제공, transaction() 메서드 |

---

## 🎨 새 모듈 추가 예시: Board

### 1. BoardRepository - CRUD만

```typescript
@Repository('boardRepository')
export class BoardRepository extends BaseRepository {
  protected get model() {
    return this.db.board;  // boards 테이블
  }

  // CRUD - 데이터 접근만
  async findById(id: number) {
    return await this.model.findUnique({ where: { id } });
  }

  async findByUserId(userId: number) {
    return await this.model.findMany({ where: { userId } });
  }

  async create(data: CreateBoardInput) {
    return await this.model.create({ data });
  }

  async update(id: number, data: Partial<Board>) {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await this.model.delete({ where: { id } });
  }
}
```

### 2. BoardService - 비즈니스 로직

```typescript
@Service('boardService')
export class BoardService extends BaseService {
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: UserRepository,
    private commentRepository: CommentRepository
  ) {
    super();
  }

  // 비즈니스 로직
  async createBoard(userId: number, data: CreateBoardDto) {
    // 1. 비즈니스 규칙: 사용자 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. 비즈니스 규칙: 제목 길이
    if (data.title.length < 5) {
      throw new Error('Title too short');
    }

    // 3. Repository를 통한 데이터 저장
    return await this.boardRepository.create({
      ...data,
      userId,
    });
  }

  async deleteBoard(boardId: number, userId: number) {
    // 1. 비즈니스 규칙: 권한 확인
    const board = await this.boardRepository.findById(boardId);
    if (board.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // 2. 트랜잭션: 게시글 + 댓글 삭제
    return await this.boardRepository.transaction(async () => {
      await this.commentRepository.deleteByBoardId(boardId);
      await this.boardRepository.delete(boardId);
    });
  }
}
```

---

## ✅ 핵심 원칙

### 1. Repository는 데이터만
- ✅ `findByUsername()`, `create()`, `update()`, `delete()`
- ❌ 비즈니스 로직 없음

### 2. Service는 비즈니스만
- ✅ 중복 체크, 유효성 검증, 규칙 적용
- ✅ 여러 Repository 조합
- ❌ 직접 Prisma 사용 안 함

### 3. BaseRepository는 연결만
- ✅ Prisma Client 제공
- ✅ 트랜잭션 메서드 제공
- ❌ CRUD 구현 안 함

### 4. 트랜잭션은 Service에서
```typescript
// ✅ Service에서 트랜잭션 관리
await this.userRepository.transaction(async () => {
  await this.userRepository.create(...);
  await this.profileRepository.create(...);
});
```

---

## 🚀 장점

1. **명확한 책임 분리**
   - Repository: 데이터
   - Service: 비즈니스
   - BaseRepository: 연결

2. **재사용성**
   - Repository는 여러 Service에서 재사용
   - Service는 여러 Repository 조합

3. **테스트 용이**
   - Repository는 Mock으로 대체 가능
   - Service만 테스트하면 됨

4. **유지보수성**
   - 비즈니스 로직 변경 → Service만 수정
   - 데이터 구조 변경 → Repository만 수정
   - ORM 변경 → BaseRepository만 수정

---

이제 **올바른 관심사 분리**가 적용되었습니다! 🎉

