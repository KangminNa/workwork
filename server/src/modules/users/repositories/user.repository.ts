import { Injectable } from '@nestjs/common';
import { IUser } from '../../../common/types';

type UserEntity = IUser & { password: string; invitedBy?: number | null };

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'member';
  workspaceId: number;
  invitedBy?: number | null;
}

/**
 * 인메모리 사용자 저장소
 * - 현재 단계에서는 DB 없이 Auth 핸들러가 동작하도록 최소한의 기능만 제공
 */
@Injectable()
export class UserRepository {
  private users: UserEntity[] = [];
  private idSeq = 1;

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async save(input: CreateUserInput): Promise<UserEntity> {
    const now = new Date();
    const user: UserEntity = {
      id: this.idSeq++,
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role,
      workspaceId: input.workspaceId,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    return user;
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  /**
   * 테스트 편의를 위한 리셋 훅
   */
  reset(): void {
    this.users = [];
    this.idSeq = 1;
  }
}
