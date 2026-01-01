import { IUser, IWorkspace, IAuthResult, IAuthToken } from '../types';

/**
 * 데이터 변환 유틸리티 (Static Only)
 * - Serialize 없이 타입만 변환
 */
export class TransformerUtil {
  /**
   * User 엔티티 → IUser 변환
   * (민감 정보 제거)
   */
  static toUserInfo(userEntity: any): IUser {
    return {
      id: userEntity.id,
      email: userEntity.email,
      name: userEntity.name,
      role: userEntity.role,
      workspaceId: userEntity.workspaceId,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    };
  }

  /**
   * Workspace 엔티티 → IWorkspace 변환
   */
  static toWorkspaceInfo(workspaceEntity: any): IWorkspace {
    return {
      id: workspaceEntity.id,
      name: workspaceEntity.name,
      ownerId: workspaceEntity.ownerId,
      inviteCode: workspaceEntity.inviteCode,
      createdAt: workspaceEntity.createdAt,
      updatedAt: workspaceEntity.updatedAt,
    };
  }

  /**
   * 인증 결과 조립
   */
  static toAuthResult(
    user: IUser,
    workspace: IWorkspace,
    token: IAuthToken,
  ): IAuthResult {
    return { user, workspace, token };
  }

  /**
   * 안전한 객체 복사 (타입 유지)
   */
  static clone<T>(obj: T): T {
    return { ...obj };
  }

  /**
   * 필드 선택 (Pick)
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * 필드 제외 (Omit)
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result as Omit<T, K>;
  }
}

