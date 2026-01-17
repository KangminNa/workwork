import { IsEmail, IsString, IsNotEmpty, MinLength, IsBoolean, ValidateIf } from 'class-validator';

/**
 * ROOT 회원가입 DTO
 */
export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * 로그인 DTO
 * ROOT/ADMIN: email + password
 * USER: username + groupCode + password
 */
export class LoginDto {
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail()
  email?: string;

  @ValidateIf((o) => o.username !== undefined && o.username !== null && o.username !== '')
  @IsString()
  username?: string;

  @ValidateIf((o) => o.groupCode !== undefined && o.groupCode !== null && o.groupCode !== '')
  @IsString()
  groupCode?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * ROOT 승인/거절 DTO
 */
export class ApproveRootDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsNotEmpty()
  adminUserId: string;
}

/**
 * 로그인 응답 DTO
 */
export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string | null;
    username: string;
    role: string;
    status: string;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  groupCode?: string;
}

/**
 * ROOT 승인 응답 DTO
 */
export interface ApproveRootResponseDto {
  user: {
    id: string;
    email: string | null;
    username: string;
    role: string;
    status: string;
    groupId: string | null;
  };
  groupCode?: string;
  groupName?: string;
}

