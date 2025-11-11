import { User } from '@prisma/client';
import { BaseRepository } from '../core/BaseRepository';
import { prisma } from '../core/db';

/**
 * User 모델에 대한 데이터 접근을 담당합니다.
 * BaseRepository를 상속받아 기본적인 CRUD 기능을 모두 자동으로 구현합니다.
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    // `prisma.user` 모델 대리자를 부모 클래스에 주입합니다.
    super(prisma.user);
  }

  // 이제 User 모델에만 특화된 메서드를 여기에 추가할 수 있습니다.
  // 예를 들어, 이메일로 사용자를 찾는 기능:
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
