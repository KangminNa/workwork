/**
 * Core Shared Types
 * 프레임워크 공통 타입
 */

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션 요청
 */
export interface PaginationRequest {
  page: number;
  limit: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 정렬 옵션
 */
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 기본 엔티티
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

