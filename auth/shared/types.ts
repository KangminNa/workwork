/**
 * Auth Module Shared Types
 */

/**
 * 로그인 요청
 */
export interface LoginRequestDto {
  username: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequestDto {
  username: string;
  password: string;
  email: string;
  phone: string;
}

/**
 * 사용자 정보 (응답용)
 */
export interface UserDto {
  id: number;
  username: string;
  email: string;
  phone: string;
  createdAt: Date;
}

/**
 * 로그인 응답
 */
export interface LoginResponseDto extends UserDto {
  token?: string;
}

/**
 * 회원가입 응답
 */
export interface RegisterResponseDto extends UserDto {}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  token: string | null;
}

