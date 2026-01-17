/**
 * Base Mapper Interface
 * - Entity와 Schema 간 변환을 담당
 * - 순수하게 변환 로직만 포함
 */
export interface IMapper<TEntity, TSchema> {
  /**
   * Domain Entity → DB Schema
   * Entity의 데이터를 DB에 저장할 형태로 변환
   */
  toPersistence(entity: TEntity): TSchema;

  /**
   * DB Schema → Domain Entity
   * DB 데이터를 Domain Entity로 변환 (재구성)
   */
  toDomain(schema: TSchema): TEntity;

  /**
   * 여러 Entity를 Schema로 변환
   */
  toPersistenceList(entities: TEntity[]): TSchema[];

  /**
   * 여러 Schema를 Entity로 변환
   */
  toDomainList(schemas: TSchema[]): TEntity[];
}

/**
 * Abstract Base Mapper
 * - 공통 변환 로직이 필요한 경우 상속
 */
export abstract class BaseMapper<TEntity, TSchema> implements IMapper<TEntity, TSchema> {
  abstract toPersistence(entity: TEntity): TSchema;
  abstract toDomain(schema: TSchema): TEntity;

  /**
   * 여러 Entity를 Schema로 변환
   */
  toPersistenceList(entities: TEntity[]): TSchema[] {
    return entities.map((entity) => this.toPersistence(entity));
  }

  /**
   * 여러 Schema를 Entity로 변환
   */
  toDomainList(schemas: TSchema[]): TEntity[] {
    return schemas.map((schema) => this.toDomain(schema));
  }
}

