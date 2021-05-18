import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserToken } from './dto/user-token.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => req.cookies['auth'],
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'shhh',
    });
  }

  async validate(payload: UserToken): Promise<UserToken> {
    return payload;
  }
}
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

