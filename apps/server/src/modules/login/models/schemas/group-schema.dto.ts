/**
 * Group Table Schema
 * - DB 테이블의 컬럼 구조를 정의
 * - 순수하게 데이터 구조만 표현 (행위 없음)
 */
export interface GroupSchema {
  id: string;
  code: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

