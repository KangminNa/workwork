/**
 * 절대 변하지 않는 기본 CRUD 인터페이스
 * 모든 엔티티가 이 4가지 기본 연산만 지원
 */
export interface IBaseRepository<T> {
  /**
   * 단일 엔티티 저장
   */
  save(entity: Partial<T>): Promise<T>;

  /**
   * 여러 엔티티 일괄 저장
   */
  saveMany(entities: Partial<T>[]): Promise<T[]>;

  /**
   * ID로 엔티티 삭제
   */
  delete(id: number): Promise<boolean>;

  /**
   * 여러 엔티티 일괄 삭제
   */
  deleteMany(ids: number[]): Promise<number>;

  /**
   * 엔티티 업데이트
   */
  update(id: number, updates: Partial<T>): Promise<T>;

  /**
   * ID로 단일 엔티티 조회
   */
  findById(id: number): Promise<T | null>;
}

