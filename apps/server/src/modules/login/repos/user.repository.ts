import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from './login.repository.interface';
import { User } from '../models/entities/user.entity';
import { UserSchema } from '../models/schemas/user-schema.dto';
import { CrudRepositoryMixin } from '../../../core/repositories/base.repository';
import { BaseMapper } from '../../../core/mappers/base.mapper';

/**
 * User Mapper (Repository 내부)
 * - Entity ↔ Schema 변환 로직
 */
class UserMapper extends BaseMapper<User, UserSchema> {
  toPersistence(entity: User): UserSchema {
    const persistence = entity.toPersistence();
    return {
      id: persistence.id,
      email: persistence.email,
      username: persistence.username,
      password: persistence.password,
      role: persistence.role,
      status: persistence.status,
      groupId: persistence.groupId,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }

  toDomain(schema: UserSchema): User {
    return User.reconstitute({
      id: schema.id,
      email: schema.email,
      username: schema.username,
      hashedPassword: schema.password,
      role: schema.role,
      status: schema.status,
      groupId: schema.groupId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}

/**
 * User Repository (Mapper 통합)
 * - CRUD + Mapping을 한 곳에서 처리
 */
const UserBaseCrud = CrudRepositoryMixin<User, UserSchema>({
  modelName: 'user',
  mapper: new UserMapper(),
});

@Injectable()
export class UserRepository extends UserBaseCrud implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma, new UserMapper());
  }
}
