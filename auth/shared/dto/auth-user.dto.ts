export type AuthUserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AuthUserDto {
  id: string;
  username: string;
  email: string;
  status: AuthUserStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}
