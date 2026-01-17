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

/**
 * Value Object Transformer Helper
 * - Decorator에서 사용할 Transformer 생성 헬퍼
 */
export class ValueObjectTransformer {
  /**
   * Value Object → Primitive 변환
   */
  static toPersistence<T>(valueObject: ValueObject<T> | null | undefined): T | null {
    if (!valueObject) return null;
    return valueObject.getValue();
  }

  /**
   * Primitive → Value Object 변환
   */
  static toDomain<T, V extends ValueObject<T>>(
    value: T | null | undefined,
    factory: (value: T) => V,
  ): V | null {
    if (value === null || value === undefined) return null;
    return factory(value);
  }

  /**
   * Transformer 객체 생성 (Decorator용)
   */
  static createTransformer<T, V extends ValueObject<T>>(factory: (value: T) => V) {
    return {
      toPersistence: (vo: V | null) => this.toPersistence(vo),
      toDomain: (value: T | null) => this.toDomain(value, factory),
    };
  }
}

