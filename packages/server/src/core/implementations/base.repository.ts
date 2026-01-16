/**
 * Core Implementations - Base Repository
 * ICrudRepository 계약의 기본 구현
 */

import {
  ICrudRepository,
  ITransactionalRepository,
  IOrmAdapter,
} from '@core/contracts/repository';
import { QueryFilter } from '@core/contracts/base';

/**
 * CRUD Repository 기본 구현
 * - Prisma ORM과 연동
 * - 다른 ORM으로 교체 가능
 */
export abstract class BaseCrudRepository<TEntity = any>
  implements
    ICrudRepository<TEntity>,
    ITransactionalRepository,
    IOrmAdapter
{
  constructor(
    public readonly client: any,
    public readonly modelName: string
  ) {}

  async get(id: string, options?: any): Promise<TEntity | null> {
    return this.client[this.modelName].findUnique({
      where: { id },
      ...options,
    });
  }

  async list(filter?: QueryFilter): Promise<TEntity[]> {
    return this.client[this.modelName].findMany(filter);
  }

  async findOne(filter: QueryFilter): Promise<TEntity | null> {
    return this.client[this.modelName].findFirst(filter);
  }

  async create(data: any): Promise<TEntity> {
    return this.client[this.modelName].create({ data });
  }

  async update(id: string, data: any): Promise<TEntity> {
    return this.client[this.modelName].update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await this.client[this.modelName].delete({
      where: { id },
    });
  }

  async count(filter?: QueryFilter): Promise<number> {
    return this.client[this.modelName].count(filter);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.client[this.modelName].count({
      where: { id },
    });
    return count > 0;
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.client.$transaction(callback);
  }
}

