/**
 * Base Entity
 * - 모든 Entity의 기본 클래스
 */
export abstract class BaseEntity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor() {
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 업데이트 시간 갱신
   */
  protected touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * 동등성 비교
   */
  public equals(other: BaseEntity): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}
