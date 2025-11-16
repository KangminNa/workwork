/**
 * Get Login Page Controller
 * 로그인 페이지 렌더링 (PageModel 반환)
 */

import { Request } from 'express';
import { GetBaseController } from '../../../core/server/controllers/GetBaseController';
import { PageModel } from '../../../common/shared/ui';

export class GetLoginPageController extends GetBaseController {
  protected async createPageModel(_req: Request): Promise<PageModel> {
    return {
      id: 'login-page',
      name: 'Login',
      path: '/login',
      title: 'Login - WorkWork',
      description: 'Login to your account',
      layout: 'centered',
      
      // Header/Footer 숨김
      header: {
        visible: false,
      },
      footer: {
        visible: false,
      },
      
      // Body: 로그인 폼 (center, column, 1-2-3)
      body: [
        {
          id: 'login-container',
          type: 'container',
          className: 'login-container',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            maxWidth: '400px',
            width: '100%',
          },
          children: [
            // 1. 로고/제목
            {
              id: 'login-title',
              type: 'text',
              props: {
                text: 'WorkWork',
                variant: 'h1',
                align: 'center',
              },
              style: {
                marginBottom: '20px',
              },
            },
            
            // 2. 이메일 입력
            {
              id: 'login-email',
              type: 'input',
              label: 'Email',
              placeholder: 'Enter your email',
              props: {
                inputType: 'email',
                autoFocus: true,
              },
              validation: [
                {
                  type: 'required',
                  message: 'Email is required',
                },
                {
                  type: 'email',
                  message: 'Invalid email format',
                },
              ],
              style: {
                width: '100%',
              },
            },
            
            // 3. 비밀번호 입력
            {
              id: 'login-password',
              type: 'input',
              label: 'Password',
              placeholder: 'Enter your password',
              props: {
                inputType: 'password',
              },
              validation: [
                {
                  type: 'required',
                  message: 'Password is required',
                },
              ],
              style: {
                width: '100%',
              },
            },
            
            // 4. 로그인 버튼 (identifier 포함)
            {
              id: 'login-submit-btn',
              type: 'button',
              identifier: 'LOGIN_SUBMIT',
              props: {
                text: 'Login',
                variant: 'primary',
                fullWidth: true,
                htmlType: 'submit',
              },
              style: {
                marginTop: '10px',
                width: '100%',
              },
            },
          ],
        },
      ],
      
      // Actions: 버튼 클릭 시 실행될 액션 정의
      actions: {
        LOGIN_SUBMIT: {
          identifier: 'LOGIN_SUBMIT',
          endpoint: '/api/auth/login',
          method: 'POST',
          onSuccess: {
            type: 'redirect',
            value: '/dashboard',
          },
          onError: {
            type: 'message',
            value: 'Login failed. Please check your credentials.',
          },
          showLoading: true,
        },
      },
      
      initialData: {},
      metadata: {
        keywords: ['login', 'auth', 'signin'],
      },
    };
  }
}

