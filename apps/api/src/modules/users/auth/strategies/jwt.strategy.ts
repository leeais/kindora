import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserContext } from '@/db/generated/prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    sessionId: string;
    role: any;
    activeContext: UserContext;
    emailVerifiedAt?: string;
  }): Promise<Express.User> {
    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role,
      activeContext: payload.activeContext,
      emailVerifiedAt: payload.emailVerifiedAt
        ? new Date(payload.emailVerifiedAt)
        : undefined,
    };
  }
}
