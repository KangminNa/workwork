import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ACTIONS_KEY, PUBLIC_QUERIES_KEY } from './public-actions.decorator';

/**
 * JWT Authentication Guard
 * - JWT 토큰 검증
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const action = request?.params?.action;
    if (action) {
      const isGet = request.method?.toUpperCase() === 'GET';
      const key = isGet ? PUBLIC_QUERIES_KEY : PUBLIC_ACTIONS_KEY;
      const publicActions =
        this.reflector.getAllAndOverride<string[]>(key, [
          context.getHandler(),
          context.getClass(),
        ]) || [];
      if (publicActions.includes(action)) {
        return true;
      }
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
