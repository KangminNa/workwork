import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * ID 기반 요청 DTO
 */
export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

/**
 * 페이지네이션 쿼리 DTO
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * 성공 응답 생성
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * 에러 응답 생성
 */
export function errorResponse(code: string, message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * 생성 성공 DTO
 */
export interface CreateSuccessDto {
  id: string;
  message: string;
}

/**
 * 업데이트 성공 DTO
 */
export interface UpdateSuccessDto {
  id: string;
  message: string;
}

/**
 * 삭제 성공 DTO
 */
export interface DeleteSuccessDto {
  message: string;
}

