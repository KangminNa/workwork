/**
 * 기본 타입 정의
 * - 모든 모듈에서 재사용
 * - Serialization 없이 메모리 공유
 */

// 기본 엔티티
export interface IBaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// 요청 컨텍스트 (모든 요청에서 공유)
export interface IRequestContext {
  requestId: string;
  timestamp: number;
  userId?: number;
  workspaceId?: number;
}

// 응답 래퍼
export interface IBaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: IErrorDetail;
  meta?: IResponseMeta;
}

// 에러 상세
export interface IErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 응답 메타데이터
export interface IResponseMeta {
  requestId: string;
  timestamp: number;
  duration?: number;
}

// 페이지네이션
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 필터
export interface IBaseFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

