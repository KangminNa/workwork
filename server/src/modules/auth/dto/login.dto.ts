import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * 로그인 DTO
 */
export class LoginDto {
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요' })
  @IsNotEmpty({ message: '이메일은 필수입니다' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  password: string;
}

