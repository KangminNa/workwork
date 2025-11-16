/**
 * Get Base Controller
 * 페이지 렌더링을 위한 기본 컨트롤러
 * 모든 GET 페이지 컨트롤러는 이 클래스를 상속받아야 함
 */

import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { PageModel, HeaderModel, FooterModel } from '../../../common/shared/ui';

export abstract class GetBaseController extends BaseController {
  /**
   * 실제 로직 구현
   */
  protected async executeImpl(req: Request, res: Response): Promise<void> {
    // 페이지 모델 생성
    const pageModel = await this.createPageModel(req);
    
    // Header/Footer 자동 삽입
    const enrichedPageModel = await this.enrichPageModel(pageModel, req);
    
    // 응답 반환
    this.ok(res, enrichedPageModel);
  }

  /**
   * 페이지 모델 생성 (하위 클래스에서 구현)
   */
  protected abstract createPageModel(req: Request): Promise<PageModel>;

  /**
   * 페이지 모델 보강 (Header/Footer 자동 삽입)
   */
  protected async enrichPageModel(pageModel: PageModel, req: Request): Promise<PageModel> {
    // Header가 없으면 기본 Header 삽입
    if (!pageModel.header) {
      pageModel.header = await this.getDefaultHeader(req);
    }

    // Footer가 없으면 기본 Footer 삽입
    if (!pageModel.footer) {
      pageModel.footer = await this.getDefaultFooter(req);
    }

    return pageModel;
  }

  /**
   * 기본 Header 생성
   */
  protected async getDefaultHeader(req: Request): Promise<HeaderModel> {
    // 사용자 정보 가져오기 (세션, JWT 등에서)
    const user = this.getUserFromRequest(req);

    return {
      visible: true,
      logo: {
        text: 'WorkWork',
        link: '/',
      },
      navigation: [
        {
          id: 'nav-home',
          label: 'Home',
          link: '/',
        },
        {
          id: 'nav-schedule',
          label: 'Schedule',
          link: '/schedule',
        },
      ],
      userInfo: user ? {
        visible: true,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        menu: [
          {
            id: 'user-profile',
            label: 'Profile',
            link: '/profile',
          },
          {
            id: 'user-settings',
            label: 'Settings',
            link: '/settings',
          },
          {
            id: 'user-logout',
            label: 'Logout',
            identifier: 'USER_LOGOUT',
          },
        ],
      } : undefined,
      style: 'default',
    };
  }

  /**
   * 기본 Footer 생성
   */
  protected async getDefaultFooter(_req: Request): Promise<FooterModel> {
    return {
      visible: true,
      copyright: `© ${new Date().getFullYear()} WorkWork. All rights reserved.`,
      linkGroups: [
        {
          title: 'Product',
          links: [
            { id: 'footer-features', label: 'Features', url: '/features' },
            { id: 'footer-pricing', label: 'Pricing', url: '/pricing' },
          ],
        },
        {
          title: 'Company',
          links: [
            { id: 'footer-about', label: 'About', url: '/about' },
            { id: 'footer-contact', label: 'Contact', url: '/contact' },
          ],
        },
      ],
      socialLinks: [
        { platform: 'github', url: 'https://github.com/workwork' },
        { platform: 'twitter', url: 'https://twitter.com/workwork' },
      ],
      style: 'default',
    };
  }

  /**
   * 요청에서 사용자 정보 추출
   */
  protected getUserFromRequest(req: Request): any {
    // TODO: 실제로는 세션이나 JWT에서 사용자 정보를 가져와야 함
    // 여기서는 예시로 req.user를 사용
    return (req as any).user || null;
  }

  /**
   * 권한 검사
   */
  protected checkPermission(req: Request, _requiredPermissions: string[]): void {
    const user = this.getUserFromRequest(req);
    
    if (!user) {
      throw {
        statusCode: 401,
        message: 'Unauthorized',
      };
    }

    // TODO: 실제 권한 검사 로직 구현
    // const hasPermission = requiredPermissions.every(p => user.permissions.includes(p));
    // if (!hasPermission) {
    //   throw { statusCode: 403, message: 'Forbidden' };
    // }
  }
}
