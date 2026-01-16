/**
 * Group Module - Service
 * ICrudService 계약 구현
 */

import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '@core/implementations';
import { ICrudService } from '@core/contracts/service';
import { GroupRepository } from './group.repository';
import { Group, CreateGroupDto, UpdateGroupDto, AddMemberDto } from './group.types';

@Injectable()
export class GroupService
  extends BaseCrudService<Group, CreateGroupDto, UpdateGroupDto>
  implements ICrudService<Group, CreateGroupDto, UpdateGroupDto>
{
  constructor(private readonly groupRepository: GroupRepository) {
    super(groupRepository);
  }

  // 기본 CRUD는 BaseCrudService에서 자동 구현
  // 비즈니스 로직만 추가

  /**
   * 그룹 생성 (Owner 자동 추가)
   */
  async create(dto: CreateGroupDto): Promise<Group> {
    return this.groupRepository.create({
      name: dto.name,
      description: dto.description,
      ownerId: dto.ownerId,
      members: {
        create: {
          userId: dto.ownerId,
          role: 'OWNER',
        },
      },
    });
  }

  /**
   * 멤버 추가
   */
  async addMember(groupId: string, dto: AddMemberDto): Promise<Group> {
    // 비즈니스 로직: 이미 멤버인지 체크 등
    return this.groupRepository.addMember(groupId, dto.userId);
  }

  /**
   * 멤버 제거
   */
  async removeMember(groupId: string, userId: string): Promise<Group> {
    // 비즈니스 로직: Owner는 제거 불가 등
    return this.groupRepository.removeMember(groupId, userId);
  }

  /**
   * Owner의 그룹 조회
   */
  async findByOwner(ownerId: string): Promise<Group[]> {
    return this.groupRepository.findByOwner(ownerId);
  }

  /**
   * User가 속한 그룹 조회
   */
  async findByUserId(userId: string): Promise<Group[]> {
    return this.groupRepository.findByUserId(userId);
  }
}

