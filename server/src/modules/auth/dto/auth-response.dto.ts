/**
 * 인증 응답 DTO
 */
export class AuthResponseDto {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'owner' | 'member';
    workspaceId: number;
  };
  workspace: {
    id: number;
    name: string;
    inviteCode: string;
  };
  accessToken: string;
}

