import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let data = req?.cookies['auth-cookie'];
          if (!data) return null;
          return JSON.parse(data).accessToken; // Later one refreshToken is a must (it will be in db)
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // Refactor into refresh strategy later on,
  // but for now it is fine
  async validate(payload: any) {
    // if (payload === null) throw new UnauthorizedException();
    if (payload === null) return null;

    return payload;
  }
}
