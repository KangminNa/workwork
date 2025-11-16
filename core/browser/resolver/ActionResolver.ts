/**
 * Action Resolver
 * identifier 기반으로 액션을 처리하는 브라우저 측 resolver
 * 서버의 AutoResolver와 대응되는 클라이언트 측 로직
 */

import { PageModel } from '../../../common/shared/ui/PageModel';

export interface ActionConfig {
  identifier: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  onSuccess?: {
    type: 'redirect' | 'message' | 'refresh' | 'callback';
    value?: any;
  };
  onError?: {
    type: 'message' | 'callback';
    value?: any;
  };
  showLoading?: boolean;
  validation?: any;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  message?: string;
  redirect?: string;
}

export class ActionResolver {
  private actions: Map<string, ActionConfig> = new Map();
  private apiBaseUrl: string;
  private loadingCallbacks: Set<(loading: boolean) => void> = new Set();

  constructor(apiBaseUrl: string = 'http://localhost:4000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * PageModel에서 액션 등록
   */
  registerActionsFromPageModel(pageModel: PageModel): void {
    if (!pageModel.actions) return;

    Object.entries(pageModel.actions).forEach(([identifier, action]) => {
      this.registerAction(identifier, action as ActionConfig);
    });
  }

  /**
   * 개별 액션 등록
   */
  registerAction(identifier: string, config: ActionConfig): void {
    this.actions.set(identifier, config);
    console.log(`[ActionResolver] Registered: ${identifier} -> ${config.method} ${config.endpoint}`);
  }

  /**
   * 액션 실행
   */
  async executeAction(identifier: string, data?: any): Promise<ActionResult> {
    const action = this.actions.get(identifier);

    if (!action) {
      console.error(`[ActionResolver] Action not found: ${identifier}`);
      return {
        success: false,
        message: `Action ${identifier} not found`,
      };
    }

    console.log(`[ActionResolver] Executing: ${identifier}`, data);

    // 로딩 시작
    if (action.showLoading) {
      this.notifyLoading(true);
    }

    try {
      // API 호출
      const response = await fetch(`${this.apiBaseUrl}${action.endpoint}`, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      // 성공 처리
      if (result.success) {
        await this.handleSuccess(action, result);
        return {
          success: true,
          data: result.data,
          message: result.message,
        };
      } else {
        // 실패 처리
        await this.handleError(action, result);
        return {
          success: false,
          message: result.message || 'Action failed',
        };
      }
    } catch (error) {
      console.error(`[ActionResolver] Error executing ${identifier}:`, error);
      await this.handleError(action, { message: 'Network error' });
      return {
        success: false,
        message: 'Network error',
      };
    } finally {
      // 로딩 종료
      if (action.showLoading) {
        this.notifyLoading(false);
      }
    }
  }

  /**
   * 성공 처리
   */
  private async handleSuccess(action: ActionConfig, result: any): Promise<void> {
    if (!action.onSuccess) return;

    switch (action.onSuccess.type) {
      case 'redirect':
        if (action.onSuccess.value) {
          window.location.href = action.onSuccess.value;
        }
        break;
      case 'refresh':
        window.location.reload();
        break;
      case 'message':
        // 메시지는 호출자가 처리
        break;
      case 'callback':
        if (typeof action.onSuccess.value === 'function') {
          action.onSuccess.value(result);
        }
        break;
    }
  }

  /**
   * 에러 처리
   */
  private async handleError(action: ActionConfig, error: any): Promise<void> {
    if (!action.onError) return;

    switch (action.onError.type) {
      case 'message':
        // 메시지는 호출자가 처리
        break;
      case 'callback':
        if (typeof action.onError.value === 'function') {
          action.onError.value(error);
        }
        break;
    }
  }

  /**
   * 로딩 상태 구독
   */
  onLoadingChange(callback: (loading: boolean) => void): () => void {
    this.loadingCallbacks.add(callback);
    return () => this.loadingCallbacks.delete(callback);
  }

  /**
   * 로딩 상태 알림
   */
  private notifyLoading(loading: boolean): void {
    this.loadingCallbacks.forEach(callback => callback(loading));
  }

  /**
   * 등록된 액션 목록
   */
  getRegisteredActions(): string[] {
    return Array.from(this.actions.keys());
  }

  /**
   * 액션 초기화
   */
  clear(): void {
    this.actions.clear();
    console.log('[ActionResolver] Cleared all actions');
  }
}

// 싱글톤 인스턴스
export const actionResolver = new ActionResolver();

