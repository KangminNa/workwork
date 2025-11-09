import { Prisma } from '@prisma/client';

export type CreateUserInput = Omit<Prisma.UserCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'loginHistories'>;
