import { PrismaClient as PrismaClientType } from '@prisma/client';

/**
 * Prisma Client 싱글톤
 * 애플리케이션 전체에서 하나의 Prisma Client 인스턴스만 사용
 */
class PrismaClientSingleton {
  private static instance: PrismaClientType;

  private constructor() {}

  public static getInstance(): PrismaClientType {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClientType({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaClientSingleton.instance.$disconnect();
      });
    }

    return PrismaClientSingleton.instance;
  }
}

export const prisma = PrismaClientSingleton.getInstance();

