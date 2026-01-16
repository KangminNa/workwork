/**
 * Core Contracts - Service Interface
 * 모든 Service가 구현해야 할 계약
 */

import { QueryFilter } from './base';

/**
 * CRUD Service 인터페이스
 * 모든 Service는 이 계약을 구현해야 함
 */
export interface ICrudService<
  TEntity = any,
  TCreateDto = any,
  TUpdateDto = any
> {
  /**
   * 단일 조회
   */
  get(id: string, options?: any): Promise<TEntity | null>;

  /**
   * 목록 조회
   */
  list(filter?: QueryFilter): Promise<TEntity[]>;

  /**
   * 생성
   */
  create(dto: TCreateDto): Promise<TEntity>;

  /**
   * 수정
   */
  update(id: string, dto: TUpdateDto): Promise<TEntity>;

  /**
   * 삭제
   */
  remove(id: string): Promise<void>;

  /**
   * 개수 조회
   */
  count(filter?: QueryFilter): Promise<number>;
}

/**
 * 트랜잭션 Service 인터페이스 (선택적)
 */
export interface ITransactionalService {
  transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

