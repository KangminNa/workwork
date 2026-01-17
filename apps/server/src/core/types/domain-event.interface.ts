/**
 * 도메인 이벤트 인터페이스
 */
export interface IDomainEvent {
  occurredAt: Date;
  getAggregateId(): string;
  getEventName(): string;
}

/**
 * 도메인 이벤트 기본 클래스
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }

  abstract getAggregateId(): string;
  abstract getEventName(): string;
}

