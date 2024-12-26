import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}

// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { jwtConstants } from '../constants';

// @Injectable()
// export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor() {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: jwtConstants.secret,
//     });
//   }

//   async validate(payload: any) {
//     return {
//       userId: payload.sub,
//       username: payload.username,
//       email: payload.email,
//       phone: payload.phone,
//     };
//   }
// }
