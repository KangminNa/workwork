import * as bcrypt from 'bcrypt';
import { User } from '../../src/modules/users/entities/user.entity';
import { Workspace } from '../../src/modules/workspaces/entities/workspace.entity';

/**
 * 테스트 데이터 생성 헬퍼
 */
export class TestDataHelper {
  /**
   * 테스트용 워크스페이스 생성
   */
  static createWorkspace(overrides?: Partial<Workspace>): Partial<Workspace> {
    return {
      name: 'Test Workspace',
      ownerId: 1,
      inviteCode: 'WORK-TEST1',
      ...overrides,
    };
  }

  /**
   * 테스트용 사용자 생성
   */
  static async createUser(overrides?: Partial<User>): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    return {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      workspaceId: 1,
      role: 'member',
      ...overrides,
    };
  }

  /**
   * 테스트용 Owner 사용자 생성
   */
  static async createOwnerUser(
    overrides?: Partial<User>,
  ): Promise<Partial<User>> {
    return this.createUser({
      email: 'owner@example.com',
      name: 'Owner User',
      role: 'owner',
      ...overrides,
    });
  }

  /**
   * 테스트용 Member 사용자 생성
   */
  static async createMemberUser(
    overrides?: Partial<User>,
  ): Promise<Partial<User>> {
    return this.createUser({
      email: 'member@example.com',
      name: 'Member User',
      role: 'member',
      ...overrides,
    });
  }

  /**
   * 랜덤 이메일 생성
   */
  static randomEmail(): string {
    const random = Math.random().toString(36).substring(7);
    return `test-${random}@example.com`;
  }

  /**
   * 랜덤 초대 코드 생성
   */
  static randomInviteCode(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WORK-${random}`;
  }
}

