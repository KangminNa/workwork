import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';

/**
 * API 공통 Decorator
 * - 권한, 인증 등을 쉽게 적용
 */

/**
 * Public API (인증 불필요)
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Roles 체크
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * API Response 문서화 헬퍼
 */
export function ApiResponse(description: string) {
  return applyDecorators(
    SetMetadata('apiDescription', description),
  );
}

