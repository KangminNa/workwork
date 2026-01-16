/**
 * Group Module - Repository
 * ICrudRepository 계약 구현
 */

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BaseCrudRepository } from '@core/implementations';
import { ICrudRepository } from '@core/contracts/repository';
import { Group } from './group.types';

@Injectable()
export class GroupRepository
  extends BaseCrudRepository<Group>
  implements ICrudRepository<Group>
{
  constructor(private readonly prisma: PrismaClient) {
    super(prisma, 'group');
  }

  // 기본 CRUD는 BaseCrudRepository에서 자동 구현
  // 커스텀 쿼리만 추가

  /**
   * Owner ID로 그룹 조회
   */
  async findByOwner(ownerId: string): Promise<Group[]> {
    return this.client.group.findMany({
      where: { ownerId },
      include: { members: true },
    });
  }

  /**
   * User가 속한 그룹 조회
   */
  async findByUserId(userId: string): Promise<Group[]> {
    return this.client.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: { members: true },
    });
  }

  /**
   * 멤버 추가
   */
  async addMember(groupId: string, userId: string): Promise<Group> {
    return this.client.group.update({
      where: { id: groupId },
      data: {
        members: {
          create: {
            userId,
            role: 'MEMBER',
          },
        },
      },
      include: { members: true },
    });
  }

  /**
   * 멤버 제거
   */
  async removeMember(groupId: string, userId: string): Promise<Group> {
    return this.client.group.update({
      where: { id: groupId },
      data: {
        members: {
          deleteMany: {
            userId,
          },
        },
      },
      include: { members: true },
    });
  }
}

