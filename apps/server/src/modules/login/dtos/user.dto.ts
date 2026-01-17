import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

/**
 * 사용자 생성 DTO (ROOT가 USER 생성)
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  rootUserId: string;
}

/**
 * 사용자 수정 DTO
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  rootUserId: string;
}

/**
 * 사용자 삭제 DTO
 */
export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  rootUserId: string;
}

/**
 * 사용자 응답 DTO
 */
export interface UserResponseDto {
  id: string;
  email: string | null;
  username: string;
  role: string;
  status: string;
  groupId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

