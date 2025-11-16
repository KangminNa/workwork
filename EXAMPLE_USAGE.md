# Repository & Service 사용 예시

## 비즈니스 모듈에서 사용하는 방법

### 1. Prisma Schema 정의 (prisma/schema.prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Repository 생성 (순수 .ts)

```typescript
// login/server/repositories/UserRepository.ts
import { BaseRepository } from '../../../core/server/repositories/BaseRepository';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user'; // Prisma 모델명 (소문자)

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  }

  /**
   * 활성 사용자 목록 조회 (커스텀 메서드)
   */
  async findActiveUsers(): Promise<User[]> {
    return await this.findMany({ 
      isActive: true 
    }, {
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

### 3. Service 생성 (순수 .ts)

```typescript
// login/server/services/UserService.ts
import { BaseService } from '../../../core/server/services/BaseService';
import { UserRepository, User } from '../repositories/UserRepository';
import * as bcrypt from 'bcrypt';

export class UserService extends BaseService<User, UserRepository> {
  constructor() {
    super(new UserRepository());
  }

  /**
   * 회원가입
   */
  async register(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<User> {
    // 비즈니스 로직: 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });
  }

  /**
   * 로그인
   */
  async login(email: string, password: string): Promise<User | null> {
    const user = await this.repository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * 생성 전 검증 (오버라이드)
   */
  protected async validateCreate(data: any): Promise<void> {
    // 이메일 중복 체크
    const exists = await this.repository.exists({ email: data.email });
    if (exists) {
      throw new Error('Email already exists');
    }
  }

  /**
   * 수정 전 검증 (오버라이드)
   */
  protected async validateUpdate(id: string, data: any): Promise<void> {
    // 사용자 존재 여부 확인
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
  }
}
```

### 4. Controller에서 사용

```typescript
// login/server/controllers/LoginSubmit.controller.ts
import { Request, Response } from 'express';
import { BaseController } from '../../../core/server/controllers/BaseController';
import { UserService } from '../services/UserService';

export class LoginSubmitController extends BaseController {
  private userService = new UserService();

  protected async executeImpl(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const user = await this.userService.login(email, password);

      if (!user) {
        return this.unauthorized(res, 'Invalid credentials');
      }

      // 세션 또는 JWT 토큰 생성
      // ...

      this.ok(res, {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error: any) {
      this.fail(res, error.message);
    }
  }
}
```

## 핵심 장점

### ✅ Prisma를 신경쓰지 않음
```typescript
// ❌ 비즈니스 모듈에서 Prisma 직접 사용 (나쁜 예)
const user = await prisma.user.findUnique({ where: { id } });

// ✅ BaseRepository 상속 (좋은 예)
const user = await this.repository.findById(id);
```

### ✅ 간단한 상속만으로 CRUD 완성
```typescript
export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user';
  // 이것만으로 findById, create, update, delete 등 모두 사용 가능!
}
```

### ✅ 비즈니스 로직은 Service에
```typescript
export class UserService extends BaseService<User, UserRepository> {
  // Repository의 기본 메서드 + 커스텀 비즈니스 로직
  async register(data) { /* ... */ }
  async login(email, password) { /* ... */ }
}
```

### ✅ 트랜잭션 지원
```typescript
await this.transaction(async (repo) => {
  await repo.create(userData);
  await repo.create(profileData);
  // 둘 다 성공하거나 둘 다 실패
});
```

## 파일 구조

```
login/                           # 비즈니스 모듈
├── server/
│   ├── repositories/
│   │   └── UserRepository.ts   # BaseRepository 상속
│   ├── services/
│   │   └── UserService.ts      # BaseService 상속
│   └── controllers/
│       └── LoginSubmit.controller.ts
└── shared/
    └── types.ts

core/                            # 인프라 (변경 없음)
├── server/
│   ├── database/
│   │   └── PrismaClient.ts     # Prisma 싱글톤
│   ├── repositories/
│   │   └── BaseRepository.ts   # 기반 클래스
│   └── services/
│       └── BaseService.ts      # 기반 클래스
```

## 요약

1. **Core**: Prisma 추상화 (BaseRepository, BaseService)
2. **비즈니스 모듈**: 순수 .ts로 상속만 받아서 사용
3. **Prisma 신경 안씀**: modelName만 지정하면 끝
4. **타입 안정성**: TypeScript 제네릭으로 타입 보장

