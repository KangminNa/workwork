/**
 * Core Contracts - Repository Interface
 * 모든 Repository가 구현해야 할 계약
 */

import { QueryFilter } from './base';

/**
 * CRUD Repository 인터페이스
 * 모든 Repository는 이 계약을 구현해야 함
 */
export interface ICrudRepository<TEntity = any> {
  /**
   * 단일 조회
   */
  get(id: string, options?: any): Promise<TEntity | null>;

  /**
   * 목록 조회
   */
  list(filter?: QueryFilter): Promise<TEntity[]>;

  /**
   * 단일 조회 (조건)
   */
  findOne(filter: QueryFilter): Promise<TEntity | null>;

  /**
   * 생성
   */
  create(data: any): Promise<TEntity>;

  /**
   * 수정
   */
  update(id: string, data: any): Promise<TEntity>;

  /**
   * 삭제
   */
  remove(id: string): Promise<void>;

  /**
   * 개수 조회
   */
  count(filter?: QueryFilter): Promise<number>;

  /**
   * 존재 여부
   */
  exists(id: string): Promise<boolean>;
}

/**
 * 트랜잭션 Repository 인터페이스 (선택적)
 */
export interface ITransactionalRepository {
  transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

/**
 * ORM Adapter 인터페이스
 */
export interface IOrmAdapter {
  readonly client: any;
  readonly modelName: string;
}

