import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GroupService } from './group.service';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  /**
   * Root의 그룹 정보 조회
   * TODO: JWT Guard 추가
   */
  @Get('my-group/:rootUserId')
  @HttpCode(HttpStatus.OK)
  async getMyGroup(@Param('rootUserId') rootUserId: string) {
    return this.groupService.getMyGroup(rootUserId);
  }

  /**
   * 사용자의 그룹 정보 조회
   * TODO: JWT Guard 추가
   */
  @Get('user-group/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserGroup(@Param('userId') userId: string) {
    return this.groupService.getUserGroup(userId);
  }
}
