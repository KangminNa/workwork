import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../../config';

/**
 * JWT Strategy
 * - JWT 토큰 검증 전략
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    // JWT payload를 request.user에 주입
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      status: payload.status,
      groupId: payload.groupId,
    };
  }
}

