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
}

/**
 * 사용자 수정 요청 DTO (액션용)
 */
export class UpdateUserRequestDto extends UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * 사용자 삭제 요청 DTO (액션용)
 */
export class DeleteUserRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

// Response DTOs are defined by entity response mapping (User.toResponse()).
