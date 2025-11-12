import { prisma } from './PrismaClient';
import type { PrismaClient } from '@prisma/client';

/**
 * BaseRepository - Prisma 연결 및 트랜잭션 관리
 * 
 * 역할:
 * 1. Prisma Client를 통한 데이터베이스 연결
 * 2. 어떤 모델(테이블)에 접근할지 결정
 * 3. 여러 Repository 작업을 묶는 트랜잭션 제공
 * 
 * Repository는 CRUD만 관심 있음 (어떤 테이블의 어떤 컬럼을)
 * Service는 비즈니스 로직만 관심 있음 (Repository들을 조합)
 * 
 * @example
 * ```typescript
 * // UserRepository - CRUD만 관심
 * @Repository('userRepository')
 * export class UserRepository extends BaseRepository {
 *   // 어떤 모델(테이블)을 사용할지
 *   protected get model() {
 *     return this.db.user;
 *   }
 *   
 *   // CRUD 메서드 - 어떤 컬럼의 무엇을 할지만
 *   async findByUsername(username: string) {
 *     return await this.model.findUnique({ where: { username } });
 *   }
 *   
 *   async create(data: CreateUserInput) {
 *     return await this.model.create({ data });
 *   }
 * }
 * 
 * // UserService - 비즈니스 로직만 관심
 * @Service('userService')
 * export class UserService extends BaseService {
 *   constructor(
 *     private userRepository: UserRepository,
 *     private profileRepository: ProfileRepository
 *   ) {}
 *   
 *   async register(data: RegisterDto) {
 *     // 비즈니스 로직: 중복 체크, 검증 등
 *     const existing = await this.userRepository.findByUsername(data.username);
 *     if (existing) throw new Error('Already exists');
 *     
 *     // 여러 Repository 작업을 트랜잭션으로 묶기
 *     return await this.transaction(async () => {
 *       const user = await this.userRepository.create(data);
 *       const profile = await this.profileRepository.create({ userId: user.id });
 *       return { user, profile };
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseRepository {
  /**
   * Prisma Client 인스턴스
   * 하위 Repository에서 this.db.user, this.db.board 등으로 모델 접근
   */
  protected get db(): PrismaClient {
    return prisma;
  }

  /**
   * 트랜잭션 실행
   * Service에서 여러 Repository 작업을 하나의 트랜잭션으로 묶을 때 사용
   * 
   * @example
   * ```typescript
   * // Service에서 사용
   * async transferPoints(fromUserId: number, toUserId: number, points: number) {
   *   return await this.transaction(async () => {
   *     // 여러 Repository 호출을 하나의 트랜잭션으로
   *     await this.userRepository.decrementPoints(fromUserId, points);
   *     await this.userRepository.incrementPoints(toUserId, points);
   *   });
   * }
   * ```
   */
  async transaction<R>(fn: () => Promise<R>): Promise<R> {
    return await prisma.$transaction(async () => {
      return await fn();
    });
  }
}
