import { BaseEntity } from '@workwork/base';

export interface UserGreeting extends BaseEntity {
  message: string;
  email?: string;
}
