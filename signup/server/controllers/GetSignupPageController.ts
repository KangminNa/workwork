/**
 * Get Signup Page Controller
 * 회원가입 페이지 렌더링 (PageModel 반환)
 */

import { Request } from 'express';
import { GetBaseController } from '../../../core/server/controllers/GetBaseController';
import { PageModel } from '../../../common/shared/ui';

export class GetSignupPageController extends GetBaseController {
  protected async createPageModel(_req: Request): Promise<PageModel> {
    return {
      id: 'signup-page',
      name: 'Signup',
      path: '/signup',
      title: 'Sign Up - WorkWork',
      description: 'Create your account',
      layout: 'centered',
      
      // Header/Footer 숨김
      header: {
        visible: false,
      },
      footer: {
        visible: false,
      },
      
      // Body: 회원가입 폼 (이메일, 아이디, 비밀번호)
      body: [
        {
          id: 'signup-form',
          type: 'form',
          props: {
            onSubmitIdentifier: 'SIGNUP_SUBMIT',
          },
          children: [
            {
              id: 'signup-container',
              type: 'container',
              className: 'signup-container',
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                maxWidth: '420px',
                width: '100%',
              },
              children: [
                // 제목
                {
                  id: 'signup-title',
                  type: 'text',
                  props: {
                    text: '회원가입',
                    variant: 'h1',
                    align: 'center',
                  },
                  style: {
                    marginBottom: '10px',
                  },
                },
                
                // 부제목
                {
                  id: 'signup-subtitle',
                  type: 'text',
                  props: {
                    text: 'WorkWork에 오신 것을 환영합니다',
                    variant: 'p',
                    align: 'center',
                  },
                  style: {
                    marginBottom: '20px',
                    color: '#666',
                  },
                },
                
                // 1. 이메일 입력
                {
                  id: 'signup-email',
                  type: 'input',
                  label: '이메일',
                  placeholder: 'example@email.com',
                  props: {
                    inputType: 'email',
                    autoFocus: true,
                  },
                  validation: [
                    {
                      type: 'required',
                      message: '이메일은 필수입니다',
                    },
                    {
                      type: 'email',
                      message: '올바른 이메일 형식이 아닙니다',
                    },
                  ],
                  style: {
                    width: '100%',
                  },
                },
                
                // 2. 아이디 입력
                {
                  id: 'signup-username',
                  type: 'input',
                  label: '아이디',
                  placeholder: '아이디를 입력하세요',
                  props: {
                    inputType: 'text',
                  },
                  validation: [
                    {
                      type: 'required',
                      message: '아이디는 필수입니다',
                    },
                    {
                      type: 'minLength',
                      value: 4,
                      message: '아이디는 최소 4자 이상이어야 합니다',
                    },
                  ],
                  style: {
                    width: '100%',
                  },
                },
                
                // 3. 비밀번호 입력
                {
                  id: 'signup-password',
                  type: 'input',
                  label: '비밀번호',
                  placeholder: '비밀번호를 입력하세요',
                  props: {
                    inputType: 'password',
                  },
                  validation: [
                    {
                      type: 'required',
                      message: '비밀번호는 필수입니다',
                    },
                    {
                      type: 'minLength',
                      value: 6,
                      message: '비밀번호는 최소 6자 이상이어야 합니다',
                    },
                  ],
                  style: {
                    width: '100%',
                  },
                },
                
                // 4. 회원가입 버튼
                {
                  id: 'signup-submit-btn',
                  type: 'button',
                  identifier: 'SIGNUP_SUBMIT',
                  props: {
                    text: '회원가입하기',
                    variant: 'primary',
                    fullWidth: true,
                    htmlType: 'submit',
                  },
                  style: {
                    marginTop: '10px',
                    width: '100%',
                  },
                },
                
                // 로그인 링크
                {
                  id: 'login-link-container',
                  type: 'container',
                  style: {
                    display: 'flex',
                    gap: '5px',
                    marginTop: '10px',
                  },
                  children: [
                    {
                      id: 'login-link-text',
                      type: 'text',
                      props: {
                        text: '이미 계정이 있으신가요?',
                        variant: 'span',
                      },
                      style: {
                        color: '#666',
                      },
                    },
                    {
                      id: 'login-link-button',
                      type: 'button',
                      identifier: 'GO_TO_LOGIN',
                      props: {
                        text: '로그인',
                        variant: 'link',
                        htmlType: 'button',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      
      // Actions: 버튼 클릭 시 실행될 액션 정의
      actions: {
        SIGNUP_SUBMIT: {
          identifier: 'SIGNUP_SUBMIT',
          endpoint: '/api/auth/signup',
          method: 'POST',
          onSuccess: {
            type: 'redirect',
            value: '/login',
          },
          onError: {
            type: 'message',
            value: '회원가입에 실패했습니다. 다시 시도해주세요.',
          },
          showLoading: true,
        },
        GO_TO_LOGIN: {
          identifier: 'GO_TO_LOGIN',
          endpoint: '/pages/login',
          method: 'GET',
          onSuccess: {
            type: 'redirect',
            value: '/login',
          },
        },
      },
      
      initialData: {},
      metadata: {
        keywords: ['signup', 'register', '회원가입'],
      },
    };
  }
}
