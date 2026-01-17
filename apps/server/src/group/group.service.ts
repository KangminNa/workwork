import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Group, User } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  /**
   * Root의 그룹 정보 조회
   */
  async getMyGroup(rootUserId: string): Promise<Group & { members: Omit<User, 'password'>[] }> {
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new ForbiddenException('Only Root users can view group details');
    }

    const group = await this.prisma.group.findUnique({
      where: { ownerId: rootUserId },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            groupId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group as Group & { members: Omit<User, 'password'>[] };
  }

  /**
   * 사용자의 그룹 정보 조회
   */
  async getUserGroup(userId: string): Promise<Group> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { group: true },
    });

    if (!user || !user.group) {
      throw new NotFoundException('User group not found');
    }

    return user.group;
  }
}
