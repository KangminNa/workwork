import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IGroupRepository } from './login.repository.interface';
import { Group } from '../models/entities/group.entity';
import { GroupSchema } from '../models/schemas/group-schema.dto';
import { CrudRepositoryMixin } from '../../../core/repositories/base.repository';
import { BaseMapper } from '../../../core/mappers/base.mapper';

/**
 * Group Mapper (Repository 내부)
 * - Entity ↔ Schema 변환 로직
 */
class GroupMapper extends BaseMapper<Group, GroupSchema> {
  toPersistence(entity: Group): GroupSchema {
    const persistence = entity.toPersistence();
    return {
      id: persistence.id,
      code: persistence.code,
      name: persistence.name,
      description: persistence.description,
      ownerId: persistence.ownerId,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }

  toDomain(schema: GroupSchema): Group {
    return Group.reconstitute({
      id: schema.id,
      code: schema.code,
      name: schema.name,
      description: schema.description,
      ownerId: schema.ownerId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}

/**
 * Group Repository (Mapper 통합)
 * - CRUD + Mapping을 한 곳에서 처리
 */
const GroupBaseCrud = CrudRepositoryMixin<Group, GroupSchema>({
  modelName: 'group',
  mapper: new GroupMapper(),
});

@Injectable()
export class GroupRepository extends GroupBaseCrud implements IGroupRepository {
  constructor(prisma: PrismaService) {
    super(prisma, new GroupMapper());
  }
}
