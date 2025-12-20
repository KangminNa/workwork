import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';
import { WorkspaceRepository } from '../../../src/modules/workspaces/repositories/workspace.repository';
import { RegisterDto } from '../../../src/modules/auth/dto/register.dto';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';

/**
 * AuthService 단위 테스트 (Mock 사용)
 * - Repository를 Mock으로 대체하여 비즈니스 로직만 테스트
 * - 실제 DB 연결 없이 Service 레이어만 검증
 */
describe('AuthService (Unit - Mock)', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let workspaceRepository: jest.Mocked<WorkspaceRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: WorkspaceRepository,
          useValue: {
            findByInviteCode: jest.fn(),
            existsByInviteCode: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    workspaceRepository = module.get(WorkspaceRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register() - 회원가입', () => {
    describe('성공 케이스', () => {
      it('성공: Owner로 회원가입', async () => {
        // Given
        const registerDto: RegisterDto = {
          email: 'owner@example.com',
          password: 'password123',
          name: '홍길동',
        };

        userRepository.findByEmail.mockResolvedValue(null);
        workspaceRepository.existsByInviteCode.mockResolvedValue(false);
        workspaceRepository.save.mockResolvedValue({
          id: 1,
          name: '홍길동의 워크스페이스',
          ownerId: 0,
          inviteCode: 'WORK-ABC123',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        userRepository.save.mockResolvedValue({
          id: 1,
          email: 'owner@example.com',
          password: 'hashedpassword',
          name: '홍길동',
          role: 'owner',
          workspaceId: 1,
          invitedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        workspaceRepository.update.mockResolvedValue({} as any);
        jwtService.sign.mockReturnValue('mock-jwt-token');

        // When
        const result = await service.register(registerDto);

        // Then
        expect(result).toBeDefined();
        expect(result.user.email).toBe('owner@example.com');
        expect(result.user.role).toBe('owner');
        expect(result.workspace).toBeDefined();
        expect(result.accessToken).toBe('mock-jwt-token');

        expect(userRepository.findByEmail).toHaveBeenCalledWith('owner@example.com');
        expect(workspaceRepository.save).toHaveBeenCalled();
        expect(userRepository.save).toHaveBeenCalled();
        expect(workspaceRepository.update).toHaveBeenCalled();
      });

      it('성공: Member로 회원가입', async () => {
        // Given
        const registerDto: RegisterDto = {
          email: 'member@example.com',
          password: 'password123',
          name: '김철수',
          inviteCode: 'WORK-ABC123',
        };

        userRepository.findByEmail.mockResolvedValue(null);
        workspaceRepository.findByInviteCode.mockResolvedValue({
          id: 1,
          name: '테스트 워크스페이스',
          ownerId: 1,
          inviteCode: 'WORK-ABC123',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        userRepository.save.mockResolvedValue({
          id: 2,
          email: 'member@example.com',
          password: 'hashedpassword',
          name: '김철수',
          role: 'member',
          workspaceId: 1,
          invitedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        jwtService.sign.mockReturnValue('mock-jwt-token');

        // When
        const result = await service.register(registerDto);

        // Then
        expect(result).toBeDefined();
        expect(result.user.email).toBe('member@example.com');
        expect(result.user.role).toBe('member');
        expect(result.workspace.id).toBe(1);
        expect(result.accessToken).toBe('mock-jwt-token');
      });
    });

    describe('실패 케이스', () => {
      it('실패: 이메일 중복', async () => {
        // Given
        const registerDto: RegisterDto = {
          email: 'duplicate@example.com',
          password: 'password123',
          name: '홍길동',
        };

        userRepository.findByEmail.mockResolvedValue({
          id: 1,
          email: 'duplicate@example.com',
        } as any);

        // When & Then
        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.register(registerDto)).rejects.toThrow(
          '이미 사용중인 이메일입니다',
        );
      });

      it('실패: 유효하지 않은 초대 코드', async () => {
        // Given
        const registerDto: RegisterDto = {
          email: 'member@example.com',
          password: 'password123',
          name: '김철수',
          inviteCode: 'INVALID',
        };

        userRepository.findByEmail.mockResolvedValue(null);

        // When & Then
        await expect(service.register(registerDto)).rejects.toThrow(
          '유효하지 않은 초대 코드입니다',
        );
      });

      it('실패: 존재하지 않는 초대 코드', async () => {
        // Given
        const registerDto: RegisterDto = {
          email: 'member@example.com',
          password: 'password123',
          name: '김철수',
          inviteCode: 'WORK-NOTFND',
        };

        userRepository.findByEmail.mockResolvedValue(null);
        workspaceRepository.findByInviteCode.mockResolvedValue(null);

        // When & Then
        await expect(service.register(registerDto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.register(registerDto)).rejects.toThrow(
          '초대 코드에 해당하는 워크스페이스를 찾을 수 없습니다',
        );
      });
    });
  });

  describe('login() - 로그인', () => {
    describe('성공 케이스', () => {
      it('성공: 로그인', async () => {
        // Given
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'password123',
        };

        const hashedPassword = await bcrypt.hash('password123', 10);

        userRepository.findByEmail.mockResolvedValue({
          id: 1,
          email: 'test@example.com',
          password: hashedPassword,
          name: '홍길동',
          role: 'owner',
          workspaceId: 1,
          invitedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);

        workspaceRepository.findById.mockResolvedValue({
          id: 1,
          name: '테스트 워크스페이스',
          ownerId: 1,
          inviteCode: 'WORK-ABC123',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);

        jwtService.sign.mockReturnValue('mock-jwt-token');

        // When
        const result = await service.login(loginDto);

        // Then
        expect(result).toBeDefined();
        expect(result.user.email).toBe('test@example.com');
        expect(result.workspace.id).toBe(1);
        expect(result.accessToken).toBe('mock-jwt-token');
      });
    });

    describe('실패 케이스', () => {
      it('실패: 존재하지 않는 이메일', async () => {
        // Given
        const loginDto: LoginDto = {
          email: 'notfound@example.com',
          password: 'password123',
        };

        userRepository.findByEmail.mockResolvedValue(null);

        // When & Then
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          '이메일 또는 비밀번호가 잘못되었습니다',
        );
      });

      it('실패: 잘못된 비밀번호', async () => {
        // Given
        const loginDto: LoginDto = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        const hashedPassword = await bcrypt.hash('correctpassword', 10);

        userRepository.findByEmail.mockResolvedValue({
          id: 1,
          email: 'test@example.com',
          password: hashedPassword,
          name: '홍길동',
          role: 'owner',
          workspaceId: 1,
          invitedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);

        // When & Then
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          '이메일 또는 비밀번호가 잘못되었습니다',
        );
      });
    });
  });
});

