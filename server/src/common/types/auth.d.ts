import { IBaseEntity, IRequestContext } from './base';

/**
 * 인증 관련 타입 정의
 * - 타입 재사용으로 serialize 방지
 */

// 사용자 기본 정보 (가장 많이 사용되는 타입)
export interface IUser extends IBaseEntity {
  email: string;
  name: string;
  role: UserRole;
  workspaceId: number;
}

// 사용자 역할
export type UserRole = 'owner' | 'member';

// 워크스페이스 정보
export interface IWorkspace extends IBaseEntity {
  name: string;
  ownerId: number;
  inviteCode: string;
}

// 인증 토큰
export interface IAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// JWT 페이로드 (토큰 내부 데이터)
export interface IJwtPayload {
  sub: number; // userId
  email: string;
  workspaceId: number;
  iat?: number;
  exp?: number;
}

// 로그인 입력
export interface ILoginInput {
  email: string;
  password: string;
}

// 회원가입 입력
export interface IRegisterInput {
  email: string;
  password: string;
  name: string;
  inviteCode?: string;
}

// 인증 결과 (공통)
export interface IAuthResult {
  user: IUser;
  workspace: IWorkspace;
  token: IAuthToken;
}

// 인증 컨텍스트 (내부 전달용)
export interface IAuthContext extends IRequestContext {
  email: string;
  password?: string;
  name?: string;
  inviteCode?: string;
  hashedPassword?: string;
  user?: IUser;
  workspace?: IWorkspace;
  token?: IAuthToken;
  role?: UserRole;
  workspaceId?: number;
}

