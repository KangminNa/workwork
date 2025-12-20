import { Repository, DeepPartial } from 'typeorm';
import { IBaseRepository } from './base.repository.interface';
import { NotFoundException } from '@nestjs/common';

/**
 * 모든 엔티티에 대한 불변 CRUD 구현
 * 이 클래스는 절대 수정되지 않음
 */
export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * 저장 - 불변
   */
  async save(entity: Partial<T>): Promise<T> {
    const created = this.repository.create(entity as DeepPartial<T>);
    return this.repository.save(created);
  }

  /**
   * 일괄 저장 - 불변
   */
  async saveMany(entities: Partial<T>[]): Promise<T[]> {
    const created = this.repository.create(entities as DeepPartial<T>[]);
    return this.repository.save(created);
  }

  /**
   * 삭제 - 불변
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * 일괄 삭제 - 불변
   */
  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.repository.delete(ids);
    return result.affected || 0;
  }

  /**
   * 업데이트 - 불변
   */
  async update(id: number, updates: Partial<T>): Promise<T> {
    await this.repository.update(id, updates as any);
    const updated = await this.findById(id);
    
    if (!updated) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    
    return updated;
  }

  /**
   * ID 조회 - 불변
   */
  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  /**
   * 조회용 QueryBuilder 제공
   * 비즈니스별로 자유롭게 확장 가능
   */
  protected createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * Raw Repository 접근 (필요 시)
   */
  protected getRawRepository(): Repository<T> {
    return this.repository;
  }
}

