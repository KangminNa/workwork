/**
 * Auth API Service
 */

import { BaseApiService } from '../../../core/browser/BaseApiService';
import type { ApiResponse } from '../../../core/shared/types';
import type {
  LoginRequestDto,
  RegisterRequestDto,
  LoginResponseDto,
  RegisterResponseDto,
} from '../../shared/types';

export class AuthApiService extends BaseApiService {
  /**
   * 로그인
   */
  async login(data: LoginRequestDto): Promise<ApiResponse<LoginResponseDto>> {
    const response = await this.post<LoginResponseDto>('/api/auth/login', data);
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * 회원가입
   */
  async register(data: RegisterRequestDto): Promise<ApiResponse<RegisterResponseDto>> {
    return await this.post<RegisterResponseDto>('/api/auth/register', data);
  }

  /**
   * 로그아웃
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * 현재 사용자 정보
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return await this.get('/api/auth/me');
  }
}

// 싱글톤
export const authApi = new AuthApiService();

