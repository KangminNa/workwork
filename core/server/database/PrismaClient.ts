/**
 * Prisma Client Singleton
 * 전역에서 하나의 Prisma 인스턴스만 사용
 */

import { PrismaClient as PrismaClientType } from '@prisma/client';

class PrismaClientSingleton {
  private static instance: PrismaClientType | null = null;

  /**
   * Prisma Client 인스턴스 가져오기
   */
  public static getInstance(): PrismaClientType {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClientType({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
      });

      console.log('[Prisma] Client initialized');
    }

    return PrismaClientSingleton.instance;
  }

  /**
   * 연결 종료
   */
  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
      console.log('[Prisma] Client disconnected');
    }
  }
}

// Export singleton instance
export const prisma = PrismaClientSingleton.getInstance();
export { PrismaClientSingleton };

