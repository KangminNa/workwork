import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../users/repositories/user.repository';
import { WorkspaceRepository } from '../workspaces/repositories/workspace.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { InviteCodeUtil } from '../../common/utils/invite-code.util';

/**
 * Auth Service
 * - 회원가입 / 로그인 비즈니스 로직
 * - Repository의 불변 메서드(save, findById 등)만 사용
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   * 1. 초대 코드 없음 → 새 워크스페이스 생성 (Owner)
   * 2. 초대 코드 있음 → 기존 워크스페이스 참여 (Member)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, inviteCode } = registerDto;

    // 1. 이메일 중복 체크
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 사용중인 이메일입니다');
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    let workspaceId: number;
    let role: 'owner' | 'member';
    let workspace: any;

    // 3. 초대 코드 처리
    if (inviteCode) {
      // 초대 코드로 가입 (Member)
      if (!InviteCodeUtil.isValid(inviteCode)) {
        throw new BadRequestException('유효하지 않은 초대 코드입니다');
      }

      workspace = await this.workspaceRepository.findByInviteCode(inviteCode);
      if (!workspace) {
        throw new NotFoundException('초대 코드에 해당하는 워크스페이스를 찾을 수 없습니다');
      }

      workspaceId = workspace.id;
      role = 'member';
    } else {
      // 새 워크스페이스 생성 (Owner)
      let generatedCode: string;
      let isUnique = false;

      // 고유한 초대 코드 생성 (중복 체크)
      while (!isUnique) {
        generatedCode = InviteCodeUtil.generate();
        isUnique = !(await this.workspaceRepository.existsByInviteCode(generatedCode));
      }

      // 워크스페이스 생성 (불변 save 메서드 사용)
      workspace = await this.workspaceRepository.save({
        name: `${name}의 워크스페이스`,
        ownerId: 0, // 임시값 (사용자 생성 후 업데이트)
        inviteCode: generatedCode,
      });

      workspaceId = workspace.id;
      role = 'owner';
    }

    // 4. 사용자 생성 (불변 save 메서드 사용)
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      workspaceId,
      role,
      invitedBy: null,
    });

    // 5. Owner인 경우 워크스페이스의 ownerId 업데이트 (불변 update 메서드 사용)
    if (role === 'owner') {
      await this.workspaceRepository.update(workspaceId, {
        ownerId: user.id,
      });
      workspace.ownerId = user.id;
    }

    // 6. JWT 토큰 생성
    const accessToken = this.generateToken(user.id, user.email, workspaceId);

    // 7. 응답 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
      },
      accessToken,
    };
  }

  /**
   * 로그인
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 1. 사용자 조회
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 3. 워크스페이스 조회 (불변 findById 메서드 사용)
    const workspace = await this.workspaceRepository.findById(user.workspaceId);
    if (!workspace) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다');
    }

    // 4. JWT 토큰 생성
    const accessToken = this.generateToken(user.id, user.email, user.workspaceId);

    // 5. 응답 반환
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: user.workspaceId,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
      },
      accessToken,
    };
  }

  /**
   * JWT 토큰 생성
   */
  private generateToken(userId: number, email: string, workspaceId: number): string {
    const payload = {
      sub: userId,
      email,
      workspaceId,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * JWT 토큰 검증
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}

