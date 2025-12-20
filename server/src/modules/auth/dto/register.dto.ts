import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * 회원가입 DTO
 */
export class RegisterDto {
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수입니다' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '이름은 필수입니다' })
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다' })
  name: string;

  @IsString()
  @IsOptional()
  inviteCode?: string;
}

