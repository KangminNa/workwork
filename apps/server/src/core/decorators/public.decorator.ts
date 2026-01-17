import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * - 인증 없이 접근 가능한 엔드포인트 표시
 * - @Public()
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

