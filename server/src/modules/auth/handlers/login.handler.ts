import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { BaseHandler } from '../../../common/abstracts/base.handler';
import {
  ILoginInput,
  IAuthResult,
  IAuthContext,
  IJwtPayload,
} from '../../../common/types';
import {
  CryptoUtil,
  ValidatorUtil,
  TransformerUtil,
  JwtUtil,
} from '../../../common/utils';
import { UserRepository } from '../../users/repositories/user.repository';
import { WorkspaceRepository } from '../../workspaces/repositories/workspace.repository';

/**
 * 로그인 핸들러
 * - 사용자 조회 → 비밀번호 검증 → 토큰 발급
 */
@Injectable()
export class LoginHandler extends BaseHandler<
  ILoginInput,
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
   * 로그인 실행
   */
  async execute(input: ILoginInput, context: IAuthContext): Promise<IAuthResult> {
    // 1. 검증
    await this.validate(input, context);

    // 2. 사용자 조회
    const userEntity = await this.userRepository.findByEmail(input.email);
    if (!userEntity) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 3. 비밀번호 검증 (Static Util 사용)
    const isValid = await CryptoUtil.verifyPassword(
      input.password,
      userEntity.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 4. 워크스페이스 조회
    const workspaceEntity = await this.workspaceRepository.findById(
      userEntity.workspaceId,
    );
    if (!workspaceEntity) {
      throw new NotFoundException('워크스페이스를 찾을 수 없습니다');
    }

    // 5. 타입 변환 (Static Util 사용 - Serialize 없음)
    const user = TransformerUtil.toUserInfo(userEntity);
    const workspace = TransformerUtil.toWorkspaceInfo(workspaceEntity);

    // 6. JWT 토큰 생성 (Static Util 사용)
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    };
    const token = JwtUtil.generateToken(payload);

    // 7. 결과 조립 (Static Util 사용)
    return TransformerUtil.toAuthResult(user, workspace, token);
  }

  /**
   * 입력 검증
   */
  protected async validate(input: ILoginInput, context: IAuthContext): Promise<void> {
    // Static Validator 사용
    if (!ValidatorUtil.isEmail(input.email)) {
      throw new UnauthorizedException('유효한 이메일을 입력해주세요');
    }
    if (!input.password) {
      throw new UnauthorizedException('비밀번호는 필수입니다');
    }
  }
}

