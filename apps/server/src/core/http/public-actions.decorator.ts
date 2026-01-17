import { SetMetadata } from '@nestjs/common';

/**
 * Public Actions Decorator
 * - BaseController의 동적 액션 라우팅에서 인증 예외 처리
 * - @PublicActions('login', 'signup')
 */
export const PUBLIC_ACTIONS_KEY = 'publicActions';
export const PublicActions = (...actions: string[]) =>
  SetMetadata(PUBLIC_ACTIONS_KEY, actions);

/**
 * Public Queries Decorator
 * - GET /:action 기반 쿼리 라우팅에서 인증 예외 처리
 */
export const PUBLIC_QUERIES_KEY = 'publicQueries';
export const PublicQueries = (...actions: string[]) =>
  SetMetadata(PUBLIC_QUERIES_KEY, actions);
