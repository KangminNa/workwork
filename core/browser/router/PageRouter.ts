/**
 * Page Router
 * 페이지 라우팅 및 네비게이션 관리
 */

import { PageModel } from '../../../common/shared/ui/PageModel';
import { actionResolver } from '../resolver/ActionResolver';

export interface RouteConfig {
  path: string;
  endpoint: string; // API endpoint to fetch PageModel
}

export class PageRouter {
  private routes: Map<string, RouteConfig> = new Map();
  private currentPage: PageModel | null = null;
  private apiBaseUrl: string;
  private pageChangeCallbacks: Set<(page: PageModel) => void> = new Set();

  constructor(apiBaseUrl: string = 'http://localhost:4000/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.initializePopStateHandler();
  }

  /**
   * 라우트 등록
   */
  registerRoute(path: string, endpoint: string): void {
    this.routes.set(path, { path, endpoint });
    console.log(`[PageRouter] Registered route: ${path} -> ${endpoint}`);
  }

  /**
   * 여러 라우트 일괄 등록
   */
  registerRoutes(routes: Record<string, string>): void {
    Object.entries(routes).forEach(([path, endpoint]) => {
      this.registerRoute(path, endpoint);
    });
  }

  /**
   * 페이지 로드
   */
  async loadPage(path: string): Promise<PageModel | null> {
    const route = this.routes.get(path);

    if (!route) {
      console.error(`[PageRouter] Route not found: ${path}`);
      return null;
    }

    try {
      console.log(`[PageRouter] Loading page: ${path}`);

      const response = await fetch(`${this.apiBaseUrl}${route.endpoint}`);
      const result = await response.json();

      if (result.success && result.data) {
        const pageModel = result.data as PageModel;
        this.currentPage = pageModel;

        // ActionResolver에 액션 등록
        actionResolver.registerActionsFromPageModel(pageModel);

        // 페이지 변경 알림
        this.notifyPageChange(pageModel);

        return pageModel;
      } else {
        console.error('[PageRouter] Failed to load page:', result.message);
        return null;
      }
    } catch (error) {
      console.error('[PageRouter] Error loading page:', error);
      return null;
    }
  }

  /**
   * 페이지 이동 (히스토리 추가)
   */
  async navigateTo(path: string, pushState: boolean = true): Promise<void> {
    const pageModel = await this.loadPage(path);

    if (pageModel && pushState) {
      window.history.pushState({ path }, '', path);
    }
  }

  /**
   * 페이지 교체 (히스토리 교체)
   */
  async replacePage(path: string): Promise<void> {
    const pageModel = await this.loadPage(path);

    if (pageModel) {
      window.history.replaceState({ path }, '', path);
    }
  }

  /**
   * 뒤로 가기
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * 앞으로 가기
   */
  goForward(): void {
    window.history.forward();
  }

  /**
   * 현재 페이지 가져오기
   */
  getCurrentPage(): PageModel | null {
    return this.currentPage;
  }

  /**
   * 페이지 변경 구독
   */
  onPageChange(callback: (page: PageModel) => void): () => void {
    this.pageChangeCallbacks.add(callback);
    return () => this.pageChangeCallbacks.delete(callback);
  }

  /**
   * 페이지 변경 알림
   */
  private notifyPageChange(page: PageModel): void {
    this.pageChangeCallbacks.forEach(callback => callback(page));
  }

  /**
   * popstate 이벤트 핸들러 초기화
   */
  private initializePopStateHandler(): void {
    window.addEventListener('popstate', (event) => {
      const path = event.state?.path || window.location.pathname;
      console.log(`[PageRouter] popstate: ${path}`);
      this.navigateTo(path, false);
    });
  }

  /**
   * 등록된 라우트 목록
   */
  getRegisteredRoutes(): string[] {
    return Array.from(this.routes.keys());
  }
}

// 싱글톤 인스턴스
export const pageRouter = new PageRouter();

