import { Post, Get, Param, Body, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../modules/login/models/entities/user.entity';

/**
 * Base Controller
 * - 모든 도메인 Controller의 공통 부모
 * - Service 모듈들을 조합하여 API 구성
 * - 자동 라우팅: handle* 메서드를 찾아서 실행
 */
export abstract class BaseController {
  /**
   * 공통 Execute 엔드포인트
   * POST /:action
   * 
   * 예시:
   * - POST /api/signup   → handleSignup()
   * - POST /api/create   → handleCreate()
   * - POST /api/approve  → handleApprove()
   */
  @Post(':action')
  @UseGuards(JwtAuthGuard)
  async execute(
    @CurrentUser() actor: User,
    @Param('action') action: string,
    @Body() params: any,
  ) {
    const methodName = `handle${this.formatAction(action)}`;
    const method = this[methodName];

    if (typeof method !== 'function') {
      throw new BadRequestException(`Action not supported: ${action}`);
    }

    return method.call(this, actor, params);
  }

  /**
   * 공통 Query 엔드포인트 (캐싱 가능)
   * GET /:action
   * 
   * 예시:
   * - GET /api/users   → queryUsers()
   */
  @Get(':action')
  @UseGuards(JwtAuthGuard)
  async query(
    @CurrentUser() actor: User,
    @Param('action') action: string,
    @Query() params: any,
  ) {
    const methodName = `query${this.formatAction(action)}`;
    const method = this[methodName];

    if (typeof method !== 'function') {
      throw new BadRequestException(`Query not supported: ${action}`);
    }

    return method.call(this, actor, params);
  }

  /**
   * Helper: 첫 글자 대문자 변환
   */
  private formatAction(action: string): string {
    if (!action) {
      return '';
    }

    return action
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
