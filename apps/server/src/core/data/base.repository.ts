import { PrismaService } from '../external/prisma/prisma.service';
import { IMapper } from './base.mapper';

/**
 * Base Repository Interface
 * - 모든 Repository가 구현해야 하는 기본 CRUD 인터페이스
 * - 조건은 where로 동적으로 받음 (하드코딩 제거)
 */
export interface IBaseRepository<TEntity, TSchema> {
  // 단일 조회
  findOne(where: Partial<TSchema>): Promise<TEntity | null>;
  
  // 다중 조회
  findMany(where?: Partial<TSchema>): Promise<TEntity[]>;
  
  // 존재 여부
  exists(where: Partial<TSchema>): Promise<boolean>;
  
  // 저장 (upsert)
  save(entity: TEntity): Promise<TEntity>;
  
  // 삭제
  delete(where: Partial<TSchema>): Promise<void>;
}

/**
 * Base Repository Mixin
 * - CRUD 기능을 제공하는 Mixin
 * - Mapper를 통해 Entity ↔ Schema 변환
 */
export interface BaseRepositoryConfig<TEntity, TSchema> {
  modelName: string;
  mapper: IMapper<TEntity, TSchema>;
}

/**
 * CRUD Mixin Factory
 * - 기본 CRUD 기능을 제공하는 Mixin 생성
 * - Mapper를 사용하여 Entity ↔ Schema 변환
 * - where 조건을 동적으로 받아서 처리 (하드코딩 제거)
 */
export function CrudRepositoryMixin<TEntity, TSchema>(
  config: BaseRepositoryConfig<TEntity, TSchema>,
) {
  abstract class CrudRepository implements IBaseRepository<TEntity, TSchema> {
    constructor(
      public readonly prisma: PrismaService,
      public readonly mapper: IMapper<TEntity, TSchema>,
    ) {}

    public get model() {
      return (this.prisma as any)[config.modelName];
    }

    /**
     * 단일 조회 - 조건을 동적으로 받음
     */
    async findOne(where: Partial<TSchema>): Promise<TEntity | null> {
      const result = await this.model.findFirst({ where });
      return result ? this.mapper.toDomain(result) : null;
    }

    /**
     * 다중 조회 - 조건을 동적으로 받음
     */
    async findMany(where?: Partial<TSchema>): Promise<TEntity[]> {
      const results = await this.model.findMany({ where });
      return this.mapper.toDomainList(results);
    }

    /**
     * 존재 여부 확인
     */
    async exists(where: Partial<TSchema>): Promise<boolean> {
      const count = await this.model.count({ where });
      return count > 0;
    }

    /**
     * 저장 (upsert)
     */
    async save(entity: TEntity): Promise<TEntity> {
      const schema = this.mapper.toPersistence(entity);

      const saved = await this.model.upsert({
        where: { id: (schema as any).id },
        update: {
          ...schema,
          updatedAt: (schema as any).updatedAt,
        },
        create: schema,
      });

      return this.mapper.toDomain(saved);
    }

    /**
     * 삭제 - 조건을 동적으로 받음
     */
    async delete(where: Partial<TSchema>): Promise<void> {
      await this.model.deleteMany({ where });
    }
  }

  return CrudRepository;
}
