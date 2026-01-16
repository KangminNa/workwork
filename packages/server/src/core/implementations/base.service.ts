/**
 * Core Implementations - Base Service
 * ICrudService 계약의 기본 구현
 */

import { ICrudService, ITransactionalService } from '@core/contracts/service';
import { ICrudRepository } from '@core/contracts/repository';
import { QueryFilter } from '@core/contracts/base';

/**
 * CRUD Service 기본 구현
 * - 공통 CRUD 로직 제공
 * - 각 도메인에서 필요한 메서드만 override
 */
export abstract class BaseCrudService<
  TEntity = any,
  TCreateDto = any,
  TUpdateDto = any
> implements ICrudService<TEntity, TCreateDto, TUpdateDto>, ITransactionalService {
  
  constructor(
    protected readonly repository: ICrudRepository<TEntity>
  ) {}

  async get(id: string, options?: any): Promise<TEntity | null> {
    return this.repository.get(id, options);
  }

  async list(filter?: QueryFilter): Promise<TEntity[]> {
    return this.repository.list(filter);
  }

  async create(dto: TCreateDto): Promise<TEntity> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: TUpdateDto): Promise<TEntity> {
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  async count(filter?: QueryFilter): Promise<number> {
    return this.repository.count(filter);
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if ('transaction' in this.repository) {
      return (this.repository as any).transaction(callback);
    }
    throw new Error('Transaction not supported by repository');
  }
}

