import 'reflect-metadata';

/**
 * Entity Metadata
 * - Entity의 메타데이터를 저장
 */
export interface EntityMetadata {
  tableName: string;
  columns: Map<string, ColumnMetadata>;
}

export interface ColumnMetadata {
  propertyKey: string;
  type: 'string' | 'number' | 'boolean' | 'Date' | 'valueObject';
  nullable?: boolean;
  transformer?: {
    toPersistence: (value: any) => any;
    toDomain: (value: any) => any;
  };
}

// Metadata Keys
const ENTITY_METADATA_KEY = Symbol('entity:metadata');
const COLUMN_METADATA_KEY = Symbol('column:metadata');

/**
 * @Entity Decorator
 * - Entity 클래스에 테이블 이름을 선언
 * 
 * @example
 * @Entity('user')
 * class User extends BaseEntity {}
 */
export function Entity(tableName: string): ClassDecorator {
  return (target: any) => {
    const existingMetadata: EntityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, target) || {
      tableName,
      columns: new Map(),
    };
    existingMetadata.tableName = tableName;
    Reflect.defineMetadata(ENTITY_METADATA_KEY, existingMetadata, target);
  };
}

/**
 * @Column Decorator
 * - Entity의 필드를 DB 컬럼으로 매핑
 * 
 * @example
 * @Column({ type: 'string' })
 * username: string;
 * 
 * @Column({ type: 'valueObject', transformer: emailTransformer })
 * email: Email;
 */
export function Column(options: Omit<ColumnMetadata, 'propertyKey'>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const constructor = target.constructor;
    const metadata: EntityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, constructor) || {
      tableName: '',
      columns: new Map(),
    };

    metadata.columns.set(propertyKey.toString(), {
      propertyKey: propertyKey.toString(),
      ...options,
    });

    Reflect.defineMetadata(ENTITY_METADATA_KEY, metadata, constructor);
  };
}

/**
 * Entity Metadata Helper
 * - Entity의 메타데이터를 조회
 */
export class EntityMetadataHelper {
  static getMetadata(entityClass: any): EntityMetadata | undefined {
    return Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
  }

  static getTableName(entityClass: any): string {
    const metadata = this.getMetadata(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} has no @Entity decorator`);
    }
    return metadata.tableName;
  }

  static getColumns(entityClass: any): Map<string, ColumnMetadata> {
    const metadata = this.getMetadata(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} has no @Entity decorator`);
    }
    return metadata.columns;
  }
}

