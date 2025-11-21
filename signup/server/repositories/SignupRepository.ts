import { User } from '@prisma/client';
import { BaseRepository } from '../../../core/server/repositories';

export class SignupRepository extends BaseRepository<User> {
  protected modelName = 'user';

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async createUser(data: { email: string; username: string; password: string; name?: string }): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  async createSignupNotification(user: User): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: user.id,
        type: 'signup',
        title: '새로운 회원가입',
        message: `${user.username}(${user.email}) 님이 가입했습니다`,
        isRead: false,
      },
    });
  }
}
