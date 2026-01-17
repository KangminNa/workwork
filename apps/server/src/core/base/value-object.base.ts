/**
 * Base Value Object
 * - 불변 값 타입의 공통 구조
 * - Email, Password, GroupCode 등의 공통 로직 추출
 */
export abstract class ValueObject<T> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this._value = Object.freeze(value);
  }

  /**
   * 값 추출
   */
  getValue(): T {
    return this._value;
  }

  /**
   * 값 비교 (동등성)
   */
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    
    if (!(other instanceof ValueObject)) {
      return false;
    }

    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  /**
   * 문자열 변환
   */
  toString(): string {
    return String(this._value);
  }
}

/**
 * String Value Object
 * - 문자열 기반 Value Object의 Base
 */
export abstract class StringValueObject extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  /**
   * 빈 문자열 체크
   */
  isEmpty(): boolean {
    return this._value.trim().length === 0;
  }

  /**
   * 길이 체크
   */
  hasLength(min: number, max?: number): boolean {
    const length = this._value.length;
    if (max !== undefined) {
      return length >= min && length <= max;
    }
    return length >= min;
  }

  /**
   * 정규식 매칭
   */
  matches(pattern: RegExp): boolean {
    return pattern.test(this._value);
  }
}

// ValueObjectTransformer removed (unused).
