/**
 * Base Service
 * 모든 Service의 기반 클래스
 * 비즈니스 로직을 처리하고 Repository를 사용
 */

import { BaseRepository } from '../repositories/BaseRepository';

export abstract class BaseService<T = any, R extends BaseRepository<T> = BaseRepository<T>> {
  protected repository: R;

  constructor(repository: R) {
    this.repository = repository;
  }

  /**
   * ID로 조회
   */
  async findById(id: string | number): Promise<T | null> {
    return await this.repository.findById(id);
  }

  /**
   * 전체 조회
   */
  async findAll(options?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }): Promise<T[]> {
    return await this.repository.findAll(options);
  }

  /**
   * 조건으로 조회
   */
  async findMany(where: any, options?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }): Promise<T[]> {
    return await this.repository.findMany(where, options);
  }

  /**
   * 단일 조회
   */
  async findOne(where: any): Promise<T | null> {
    return await this.repository.findOne(where);
  }

  /**
   * 생성
   */
  async create(data: any): Promise<T> {
    // 하위 클래스에서 validation 로직 추가 가능
    await this.validateCreate(data);
    return await this.repository.create(data);
  }

  /**
   * 수정
   */
  async update(id: string | number, data: any): Promise<T> {
    // 하위 클래스에서 validation 로직 추가 가능
    await this.validateUpdate(id, data);
    return await this.repository.update(id, data);
  }

  /**
   * 삭제
   */
  async delete(id: string | number): Promise<T> {
    // 하위 클래스에서 validation 로직 추가 가능
    await this.validateDelete(id);
    return await this.repository.delete(id);
  }

  /**
   * 개수 조회
   */
  async count(where?: any): Promise<number> {
    return await this.repository.count(where);
  }

  /**
   * 존재 여부 확인
   */
  async exists(where: any): Promise<boolean> {
    return await this.repository.exists(where);
  }

  /**
   * 생성 전 검증 (하위 클래스에서 오버라이드)
   */
  protected async validateCreate(_data: any): Promise<void> {
    // 기본 구현 없음, 하위 클래스에서 필요시 구현
  }

  /**
   * 수정 전 검증 (하위 클래스에서 오버라이드)
   */
  protected async validateUpdate(_id: string | number, _data: any): Promise<void> {
    // 기본 구현 없음, 하위 클래스에서 필요시 구현
  }

  /**
   * 삭제 전 검증 (하위 클래스에서 오버라이드)
   */
  protected async validateDelete(_id: string | number): Promise<void> {
    // 기본 구현 없음, 하위 클래스에서 필요시 구현
  }

  /**
   * 트랜잭션 실행
   */
  protected async transaction<TResult>(
    fn: (repository: R) => Promise<TResult>
  ): Promise<TResult> {
    return await this.repository.transaction(async (_prisma) => {
      return await fn(this.repository);
    });
  }
}

