import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseHandler } from '../../../common/abstracts/base.handler';
import {
  IRegisterInput,
  IAuthResult,
  IAuthContext,
  IJwtPayload,
  UserRole,
} from '../../../common/types';
import {
  CryptoUtil,
  ValidatorUtil,
  TransformerUtil,
  JwtUtil,
} from '../../../common/utils';
import { UserRepository } from '../../users/repositories/user.repository';
import { WorkspaceRepository } from '../../workspaces/repositories/workspace.repository';
import { InviteCodeUtil } from '../../../common/utils/invite-code.util';
import { ConfigLoader } from '../../../config/config.loader';

/**
 * 회원가입 핸들러
 * - 이메일 중복 체크 → 워크스페이스 처리 → 사용자 생성 → 토큰 발급
 */
@Injectable()
export class RegisterHandler extends BaseHandler<
  IRegisterInput,
  IAuthResult,
  IAuthContext
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {
    super();
  }

  /**
   * 회원가입 실행
   */
  async execute(
    input: IRegisterInput,
    context: IAuthContext,
  ): Promise<IAuthResult> {
    // 1. 검증
    await this.validate(input, context);

    // 2. 이메일 중복 체크
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('이미 사용중인 이메일입니다');
    }

    // 3. 비밀번호 해싱 (Static Util)
    const hashedPassword = await CryptoUtil.hashPassword(input.password);

    // 4. 워크스페이스 처리
    let workspace: any;
    let role: UserRole;
    let workspaceId: number;

    if (input.inviteCode) {
      // 초대 코드로 가입 (Member)
      workspace = await this.handleInviteCode(input.inviteCode);
      workspaceId = workspace.id;
      role = 'member';
    } else {
      // 새 워크스페이스 생성 (Owner)
      workspace = await this.createWorkspace(input.name);
      workspaceId = workspace.id;
      role = 'owner';
    }

    // 5. 사용자 생성
    const userEntity = await this.userRepository.save({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      workspaceId,
      role,
      invitedBy: null,
    });

    // 6. Owner인 경우 워크스페이스 업데이트
    if (role === 'owner') {
      await this.workspaceRepository.update(workspaceId, {
        ownerId: userEntity.id,
      });
      workspace.ownerId = userEntity.id;
    }

    // 7. 타입 변환 및 토큰 생성 (Static Utils)
    const user = TransformerUtil.toUserInfo(userEntity);
    const workspaceInfo = TransformerUtil.toWorkspaceInfo(workspace);

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    };
    const token = JwtUtil.generateToken(payload);

    // 8. 결과 조립
    return TransformerUtil.toAuthResult(user, workspaceInfo, token);
  }

  /**
   * 입력 검증
   */
  protected async validate(
    input: IRegisterInput,
    context: IAuthContext,
  ): Promise<void> {
    if (!ValidatorUtil.isEmail(input.email)) {
      throw new BadRequestException('유효한 이메일을 입력해주세요');
    }
    if (!ValidatorUtil.isStrongPassword(input.password)) {
      throw new BadRequestException('비밀번호는 최소 6자 이상이어야 합니다');
    }
    if (!ValidatorUtil.isValidName(input.name, 2)) {
      throw new BadRequestException('이름은 최소 2자 이상이어야 합니다');
    }
  }

  /**
   * 초대 코드 처리
   */
  private async handleInviteCode(inviteCode: string): Promise<any> {
    if (!InviteCodeUtil.isValid(inviteCode)) {
      throw new BadRequestException('유효하지 않은 초대 코드입니다');
    }

    const workspace = await this.workspaceRepository.findByInviteCode(
      inviteCode,
    );
    if (!workspace) {
      throw new NotFoundException(
        '초대 코드에 해당하는 워크스페이스를 찾을 수 없습니다',
      );
    }

    return workspace;
  }

  /**
   * 새 워크스페이스 생성
   */
  private async createWorkspace(name: string): Promise<any> {
    const config = ConfigLoader.get();

    // 고유한 초대 코드 생성
    let generatedCode: string;
    let isUnique = false;

    while (!isUnique) {
      generatedCode = InviteCodeUtil.generate();
      isUnique = !(await this.workspaceRepository.existsByInviteCode(
        generatedCode,
      ));
    }

    // 워크스페이스 생성
    return await this.workspaceRepository.save({
      name: `${name}의 워크스페이스`,
      ownerId: 0, // 임시값 (사용자 생성 후 업데이트)
      inviteCode: generatedCode,
    });
  }
}

