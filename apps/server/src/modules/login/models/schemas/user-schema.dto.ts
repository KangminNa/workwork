/**
 * User Table Schema
 * - DB 테이블의 컬럼 구조를 정의
 * - 순수하게 데이터 구조만 표현 (행위 없음)
 */
export interface UserSchema {
  id: string;
  email: string | null;
  username: string;
  password: string;
  role: string;
  status: string;
  groupId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

