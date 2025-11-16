/**
 * Login Module Entry Point
 * AutoResolver에 컨트롤러 등록
 */

import { autoResolver } from '../../core/server/resolver/AutoResolver';
import { GetLoginPageController } from './controllers/GetLoginPageController';
import { LoginSubmitController } from './controllers/LoginSubmitController';

/**
 * Login 모듈 초기화
 */
export function initializeLoginModule(): void {
  // GET /api/pages/login -> 로그인 페이지 렌더링
  autoResolver.register({
    identifier: 'GET_LOGIN_PAGE',
    method: 'GET',
    path: '/pages/login',
    controller: new GetLoginPageController(),
  });

  // POST /api/auth/login -> 로그인 처리
  autoResolver.register({
    identifier: 'LOGIN_SUBMIT',
    method: 'POST',
    path: '/auth/login',
    controller: new LoginSubmitController(),
  });

  console.log('[Login Module] Initialized');
}

