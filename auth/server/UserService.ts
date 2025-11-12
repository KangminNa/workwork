import { Service } from '../../core/server/decorators/index.js';
import { BaseService } from '../../core/server/BaseService.js';
import { UserRepository } from './UserRepository.js';
import { CreateUserDto } from './dto/CreateUserDto.js';
import { LoginDto } from './dto/LoginDto.js';
import { UserResponseDto } from './dto/UserResponseDto.js';
import { User } from './entities/User.js';
import bcrypt from 'bcryptjs';

@Service('userService')
export class UserService extends BaseService {
  constructor(
    private userRepository: UserRepository
  ) {
    super();
  }

  /**
   * 비밀번호 해싱
   */
  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * 비밀번호 검증
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  /**
   * User 엔티티를 Response DTO로 변환 (비밀번호 제외)
   */
  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  /**
   * 회원가입 - 비즈니스 로직
   */
  async register(data: CreateUserDto): Promise<UserResponseDto> {
    // 1. 비즈니스 로직: 중복 체크
    const existingByUsername = await this.userRepository.findByUsername(data.username);
    if (existingByUsername) {
      throw new Error('Username already exists');
    }

    const existingByEmail = await this.userRepository.findByEmail(data.email);
    if (existingByEmail) {
      throw new Error('Email already exists');
    }

    const existingByPhone = await this.userRepository.findByPhone(data.phone);
    if (existingByPhone) {
      throw new Error('Phone number already exists');
    }

    // 2. 비즈니스 로직: 유효성 검증
    if (!data.username || data.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!data.phone || data.phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    // 3. 비즈니스 로직: 비밀번호 해싱
    const hashedPassword = this.hashPassword(data.password);

    // 4. Repository를 통한 데이터 저장
    const user = await this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
      phone: data.phone,
    });

    console.log(`✅ User registered: ${user.username} (ID: ${user.id})`);

    return this.toResponseDto(user);
  }

  /**
   * 로그인 - 비즈니스 로직
   */
  async login(data: LoginDto): Promise<UserResponseDto> {
    // 1. Repository를 통한 데이터 조회
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // 2. 비즈니스 로직: 비밀번호 검증
    const isPasswordValid = this.verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    console.log(`✅ User logged in: ${user.username} (ID: ${user.id})`);

    return this.toResponseDto(user);
  }

  /**
   * 사용자 정보 조회
   */
  async getUserById(userId: number): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return this.toResponseDto(user);
  }

  /**
   * 모든 사용자 조회 (관리자용)
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => this.toResponseDto(user));
  }

  /**
   * 트랜잭션 예시: 여러 Repository 작업을 하나로 묶기
   * Service에서 트랜잭션을 관리
   */
  async registerWithProfile(userData: CreateUserDto, profileData: any) {
    return await this.userRepository.transaction(async () => {
      // 1. UserRepository를 통한 사용자 생성
      const user = await this.userRepository.create({
        username: userData.username,
        password: this.hashPassword(userData.password),
        email: userData.email,
        phone: userData.phone,
      });

      // 2. 다른 Repository 작업 (예: ProfileRepository)
      // const profile = await this.profileRepository.create({
      //   userId: user.id,
      //   ...profileData,
      // });

      return user;
    });
  }

  /**
   * BaseService의 추상 메서드 구현
   */
  protected async run(data: any): Promise<any> {
    // 이 메서드는 필요시 사용
    return data;
  }
}

