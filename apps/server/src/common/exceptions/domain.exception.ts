/**
 * 도메인 규칙 위반 시 발생하는 예외
 */
export class DomainException extends Error {
  public readonly status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'DomainException';
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}
