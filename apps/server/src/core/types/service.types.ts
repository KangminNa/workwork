/**
 * Service 공통 타입 정의
 * - 모든 Service가 공유하는 타입
 * - 응답 형태 표준화
 */

/**
 * Service Response 베이스
 * - 성공/실패를 명확히 구분
 */
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

/**
 * Paginated Response
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Void Result (성공만 표시)
 */
export interface VoidResult {
  success: boolean;
}

