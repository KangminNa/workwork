/**
 * Signup Module Entry Point
 * AutoResolver에 컨트롤러 등록
 */

import { autoResolver } from '../../core/server/resolver/AutoResolver';
import { GetSignupPageController } from './controllers/GetSignupPageController';
import { SignupSubmitController } from './controllers/SignupSubmitController';
import { SignupRepository } from './repositories/SignupRepository';
import { SignupService } from './services/SignupService';

/**
 * Signup 모듈 초기화
 */
export function initializeSignupModule(): void {
  const signupRepository = new SignupRepository();
  const signupService = new SignupService(signupRepository);

  // GET /api/pages/signup -> 회원가입 페이지 렌더링
  autoResolver.register({
    identifier: 'GET_SIGNUP_PAGE',
    method: 'GET',
    path: '/pages/signup',
    controller: new GetSignupPageController(),
  });

  // POST /api/auth/signup -> 회원가입 처리
  autoResolver.register({
    identifier: 'SIGNUP_SUBMIT',
    method: 'POST',
    path: '/auth/signup',
    controller: new SignupSubmitController(signupService),
  });

  console.log('[Signup Module] Initialized');
}
