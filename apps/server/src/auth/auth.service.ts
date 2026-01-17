import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, Group } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Root 회원가입 (ADMIN 승인 필요)
   */
  async signup(
    email: string,
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Root 사용자 생성 (PENDING 상태)
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'ROOT',
        status: 'PENDING', // ADMIN 승인 대기
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 로그인
   * - ROOT/ADMIN: email + password
   * - USER: username + groupCode + password
   */
  async login(
    email: string | undefined,
    username: string | undefined,
    groupCode: string | undefined,
    password: string,
  ): Promise<{ accessToken: string; user: Omit<User, 'password'>; groupCode?: string }> {
    let user: (User & { ownedGroup?: Group | null; group?: Group | null }) | null = null;

    // 1. groupCode가 있으면 USER 로그인
    if (groupCode && username) {
      // groupCode로 그룹 찾기
      const group = await this.prisma.group.findUnique({
        where: { code: groupCode },
      });

      if (!group) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // username + groupId로 사용자 찾기
      user = await this.prisma.user.findFirst({
        where: {
          username,
          groupId: group.id,
        },
        include: {
          group: true,
        },
      });
    }
    // 2. email이 있으면 ROOT/ADMIN 로그인
    else if (email) {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          ownedGroup: true,
          group: true,
        },
      });
    }
    // 3. 둘 다 없으면 에러
    else {
      throw new UnauthorizedException('Email or (username + groupCode) required');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 토큰 발급
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      groupId: user.groupId,
    };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      accessToken,
      user: userWithoutPassword,
      groupCode: user.ownedGroup?.code || user.group?.code,
    };
  }

  /**
   * ADMIN이 Root 승인
   */
  async approveRoot(
    adminUserId: string,
    rootUserId: string,
    approved: boolean,
  ): Promise<{ user: Omit<User, 'password'>; groupCode?: string }> {
    // ADMIN 확인
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can approve Root users');
    }

    // Root 사용자 확인
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new NotFoundException('Root user not found');
    }

    if (!approved) {
      // 거절
      await this.prisma.user.update({
        where: { id: rootUserId },
        data: { status: 'REJECTED' },
      });

      const { password: _, ...result } = rootUser;
      return { user: result };
    }

    // 승인: 그룹 생성
    const generatedGroupCode = randomBytes(3).toString('hex').toUpperCase();

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 그룹 생성
      const group = await tx.group.create({
        data: {
          name: `${rootUser.username}'s Workspace`,
          description: 'Root user workspace',
          code: generatedGroupCode,
          ownerId: rootUserId,
        },
      });

      // 2. Root 사용자 승인 및 그룹 연결
      const updatedUser = await tx.user.update({
        where: { id: rootUserId },
        data: {
          status: 'APPROVED',
          groupId: group.id,
        },
      });

      return { user: updatedUser, group };
    });

    const { password: _, ...userWithoutPassword } = result.user;
    return {
      user: userWithoutPassword,
      groupCode: result.group.code,
    };
  }

  /**
   * ADMIN이 승인 대기 중인 Root 목록 조회
   */
  async getPendingRoots(adminUserId: string): Promise<Omit<User, 'password'>[]> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can view pending Root users');
    }

    const pendingRoots = await this.prisma.user.findMany({
      where: {
        role: 'ROOT',
        status: 'PENDING',
      },
    });

    return pendingRoots.map(({ password, ...user }) => user);
  }

  /**
   * Root가 사용자 생성
   */
  async createUser(
    rootUserId: string,
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
      include: { ownedGroup: true },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new ForbiddenException('Only Root users can create users');
    }

    if (!rootUser.ownedGroup) {
      throw new NotFoundException('Root user does not own a group');
    }

    // 같은 그룹 내에서 username 중복 확인
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
        groupId: rootUser.groupId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists in this group');
    }

    // 사용자 생성 (USER는 email 불필요)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: null, // USER는 email 없이 username + groupCode로 로그인
        username,
        password: hashedPassword,
        role: 'USER',
        status: 'APPROVED', // User는 즉시 승인
        group: {
          connect: { id: rootUser.groupId },
        },
      },
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  /**
   * Root의 그룹 내 모든 사용자 조회
   */
  async getGroupUsers(rootUserId: string): Promise<Omit<User, 'password'>[]> {
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new ForbiddenException('Only Root users can view group users');
    }

    const users = await this.prisma.user.findMany({
      where: { groupId: rootUser.groupId },
    });

    return users.map(({ password, ...user }) => user);
  }

  /**
   * 사용자 수정 (Root만 가능)
   */
  async updateUser(
    rootUserId: string,
    userId: string,
    username?: string,
    password?: string,
  ): Promise<Omit<User, 'password'>> {
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new ForbiddenException('Only Root users can update users');
    }

    const userToUpdate = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.role === 'ROOT' || userToUpdate.role === 'ADMIN') {
      throw new ForbiddenException('Cannot update Root or Admin user');
    }

    if (userToUpdate.groupId !== rootUser.groupId) {
      throw new ForbiddenException('Can only update users from your own group');
    }

    // username 중복 확인 (변경하는 경우만)
    if (username && username !== userToUpdate.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username,
          groupId: rootUser.groupId,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists in this group');
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (username) {
      updateData.username = username;
      // USER는 email이 없으므로 업데이트 불필요
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  /**
   * 사용자 삭제 (Root만 가능)
   */
  async deleteUser(rootUserId: string, userId: string): Promise<{ message: string }> {
    const rootUser = await this.prisma.user.findUnique({
      where: { id: rootUserId },
    });

    if (!rootUser || rootUser.role !== 'ROOT') {
      throw new ForbiddenException('Only Root users can delete users');
    }

    const userToDelete = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    if (userToDelete.role === 'ROOT' || userToDelete.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete Root or Admin user');
    }

    if (userToDelete.groupId !== rootUser.groupId) {
      throw new ForbiddenException('Can only delete users from your own group');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}
