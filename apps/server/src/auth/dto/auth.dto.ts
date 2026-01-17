import { IsEmail, IsString, MinLength, IsNotEmpty, IsBoolean, IsOptional, ValidateIf } from 'class-validator';

// Root 회원가입 DTO (ADMIN 승인 필요)
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

// 로그인 DTO
// ROOT/ADMIN: email + password
// USER: username + groupCode + password
export class LoginDto {
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail()
  email?: string; // ROOT, ADMIN용 (선택)

  @ValidateIf((o) => o.username !== undefined && o.username !== null && o.username !== '')
  @IsString()
  username?: string; // USER용 (선택)

  @ValidateIf((o) => o.groupCode !== undefined && o.groupCode !== null && o.groupCode !== '')
  @IsString()
  groupCode?: string; // USER는 필수, ROOT/ADMIN은 선택

  @IsString()
  @IsNotEmpty()
  password: string; // 필수
}

// Root가 사용자 생성 DTO
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  rootUserId: string; // ROOT 사용자 ID (JWT 구현 전까지 필요)
}

// Root가 사용자 수정 DTO
export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  rootUserId: string; // ROOT 사용자 ID (JWT 구현 전까지 필요)
}

// Root가 사용자 삭제 DTO
export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  rootUserId: string; // ROOT 사용자 ID (JWT 구현 전까지 필요)
}

// Root 승인 DTO
export class ApproveRootDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsNotEmpty()
  adminUserId: string;
}
