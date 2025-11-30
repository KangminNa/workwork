import { BaseEntity } from '@workwork/base/server/entities/base.entity';
import { AuthUserStatus } from '@workwork/auth/shared';

export interface AuthUser extends BaseEntity {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  status: AuthUserStatus;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
