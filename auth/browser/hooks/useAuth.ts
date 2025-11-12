/**
 * useAuth Hook
 * 인증 비즈니스 로직
 */

import { useState } from 'react';
import { authApi } from '../services/authApi';
import type {
  LoginRequestDto,
  RegisterRequestDto,
  AuthState,
  UserDto,
} from '../../shared/types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인
   */
  const login = async (data: LoginRequestDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);

      if (response.success && response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          token: response.data.token || null,
        });
        return { success: true, user: response.data };
      } else {
        const errorMessage = response.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 회원가입
   */
  const register = async (data: RegisterRequestDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        return { success: true, user: response.data };
      } else {
        const errorMessage = response.error || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 로그아웃
   */
  const logout = () => {
    authApi.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return {
    authState,
    loading,
    error,
    login,
    register,
    logout,
  };
};

