import { IBaseRepository } from '../../../core/data/base.repository';
import { User } from '../models/entities/user.entity';
import { Group } from '../models/entities/group.entity';

/**
 * Repository Interfaces
 * - BaseRepository 상속으로 CRUD 자동 제공
 */
export interface IUserRepository extends IBaseRepository<User, any> {}
export interface IGroupRepository extends IBaseRepository<Group, any> {}

