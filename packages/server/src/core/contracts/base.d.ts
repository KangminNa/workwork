/**
 * Core Contracts - Base Types
 * 모든 모듈에서 사용하는 기본 타입 정의
 */

/**
 * HTTP 메서드
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 쿼리 필터 (ORM 독립적)
 */
export interface QueryFilter {
  where?: Record<string, any>;
  include?: Record<string, boolean | object>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  skip?: number;
  take?: number;
}

/**
 * 통일된 API 응답 포맷
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    timestamp: string;
    path?: string;
  };
  timestamp: string;
}

/**
 * 로그 엔트리
 */
export interface LogEntry {
  type: 'REQUEST' | 'RESPONSE' | 'ERROR';
  method: HttpMethod;
  url: string;
  statusCode?: number;
  duration?: string;
  body?: any;
  params?: any;
  query?: any;
  message?: string;
  stack?: string;
  timestamp: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

