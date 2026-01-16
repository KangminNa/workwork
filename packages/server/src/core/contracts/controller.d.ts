/**
 * Core Contracts - Controller Interface
 * 모든 Controller가 구현해야 할 계약
 */

import { QueryFilter } from './base';

/**
 * CRUD Controller 인터페이스
 * 모든 Controller는 이 계약을 구현해야 함
 */
export interface ICrudController<
  TCreateDto = any,
  TUpdateDto = any,
  TEntity = any
> {
  /**
   * GET /resource
   * 목록 조회
   */
  list(query?: QueryFilter): Promise<TEntity[]>;

  /**
   * GET /resource/:id
   * 단일 조회
   */
  get(id: string): Promise<TEntity>;

  /**
   * POST /resource
   * 생성
   */
  create(dto: TCreateDto): Promise<TEntity>;

  /**
   * PUT /resource/:id
   * 수정
   */
  update(id: string, dto: TUpdateDto): Promise<TEntity>;

  /**
   * DELETE /resource/:id
   * 삭제
   */
  remove(id: string): Promise<void>;
}

/**
 * WebSocket Handler 인터페이스 (선택적)
 */
export interface IWebSocketHandler {
  handleConnection(client: any): Promise<void>;
  handleDisconnect(client: any): Promise<void>;
  handleMessage(client: any, payload: any): Promise<void>;
}

/**
 * Message Queue Handler 인터페이스 (선택적)
 */
export interface IMessageQueueHandler<TData = any> {
  process(job: { id: string; data: TData }): Promise<void>;
  onCompleted?(job: { id: string; data: TData }, result: any): Promise<void>;
  onFailed?(job: { id: string; data: TData }, error: Error): Promise<void>;
}

