/**
 * Group Module - Controller
 * ICrudController 계약 구현
 */

import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { BaseCrudController } from '@core/implementations';
import { ICrudController } from '@core/contracts/controller';
import { GroupService } from './group.service';
import { Group, CreateGroupDto, UpdateGroupDto, AddMemberDto } from './group.types';

@Controller('groups')
export class GroupController
  extends BaseCrudController<CreateGroupDto, UpdateGroupDto, Group>
  implements ICrudController<CreateGroupDto, UpdateGroupDto, Group>
{
  constructor(private readonly groupService: GroupService) {
    super(groupService);
  }

  // 기본 CRUD는 BaseCrudController에서 자동 구현:
  // - GET    /groups
  // - GET    /groups/:id
  // - POST   /groups
  // - PUT    /groups/:id
  // - DELETE /groups/:id

  // 추가 엔드포인트만 작성

  /**
   * POST /groups/:id/members
   * 멤버 추가
   */
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ): Promise<Group> {
    return this.groupService.addMember(id, dto);
  }

  /**
   * DELETE /groups/:id/members/:userId
   * 멤버 제거
   */
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<Group> {
    return this.groupService.removeMember(id, userId);
  }

  /**
   * GET /groups/owner/:ownerId
   * Owner의 그룹 조회
   */
  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: string): Promise<Group[]> {
    return this.groupService.findByOwner(ownerId);
  }

  /**
   * GET /groups/user/:userId
   * User가 속한 그룹 조회
   */
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Group[]> {
    return this.groupService.findByUserId(userId);
  }
}

