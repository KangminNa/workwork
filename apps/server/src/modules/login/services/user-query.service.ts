import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../repositories/login.repository.interface';
import { User } from '../models/entities/user.entity';
import { UserRole } from '../models/user-role.enum';
import { UserStatus } from '../models/user-status.enum';
import { BaseService } from '../../../core/services/base.service';

/**
 * User Query Service
 * - 사용자 조회 전담
 */
@Injectable()
export class UserQueryService extends BaseService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {
    super('UserQueryService');
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * 단일 조건으로 사용자 조회
   */
  async findOne(where: any): Promise<User | null> {
    return this.userRepo.findOne(where);
  }

  /**
   * 여러 조건으로 사용자 목록 조회
   */
  async findByGroup(groupId: string, role?: UserRole): Promise<User[]> {
    const where: any = { groupId };
    if (role) where.role = role;
    return this.userRepo.findMany(where);
  }

  /**
   * 승인 대기 중인 ROOT 사용자 조회
   */
  async findPending(): Promise<User[]> {
    return this.userRepo.findMany({
      role: UserRole.ROOT,
      status: UserStatus.PENDING,
    });
  }

  /**
   * 사용자 존재 여부 확인
   */
  async exists(where: any): Promise<boolean> {
    return this.userRepo.exists(where);
  }
}
