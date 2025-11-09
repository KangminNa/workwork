import { prisma } from '../../01-core/src/server';
import { Prisma } from '@prisma/client';

type Model = Uncapitalize<Prisma.ModelName>;

export const findUnique = <T extends Model>(
  model: T,
  args: Prisma.Args<(typeof prisma)[T], 'findUnique'>
) => {
  return (prisma[model] as any).findUnique(args);
};

export const create = <T extends Model>(
  model: T,
  args: Prisma.Args<(typeof prisma)[T], 'create'>
) => {
  return (prisma[model] as any).create(args);
};
