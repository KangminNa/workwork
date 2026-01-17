/**
 * Repository 공통 타입 정의
 * - 모든 Repository가 공유하는 타입
 * - 모듈별 반복 제거
 */

/**
 * Schema 베이스 타입
 * - 모든 DB 테이블이 가지는 공통 필드
 */
export interface BaseSchema {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Where 조건 타입 헬퍼
 * - Prisma의 where 조건을 타입 안전하게 사용
 */
export type WhereCondition<T> = Partial<T>;

/**
 * Order By 조건 타입
 */
export type OrderByCondition<T> = Partial<{
  [K in keyof T]: 'asc' | 'desc';
}>;

/**
 * Pagination 옵션
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Find Options (확장 가능)
 */
export interface FindOptions<T> {
  where?: WhereCondition<T>;
  orderBy?: OrderByCondition<T>;
  pagination?: PaginationOptions;
}

