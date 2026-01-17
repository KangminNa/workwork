/**
 * 도메인 규칙 위반 시 발생하는 예외
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
    Error.captureStackTrace(this, this.constructor);
  }
}

