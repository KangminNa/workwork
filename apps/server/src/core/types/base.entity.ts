import { IDomainEvent } from './domain-event.interface';

/**
 * Base Entity
 * - 모든 Entity의 기본 클래스
 * - Domain Event 관리
 */
export abstract class BaseEntity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  private _domainEvents: IDomainEvent[] = [];

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
   * Domain Event 추가
   */
  protected addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Domain Events 조회
   */
  public getDomainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Domain Events 초기화
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
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

