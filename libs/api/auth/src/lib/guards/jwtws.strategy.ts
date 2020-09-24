import { ExecutionContext, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwtWs') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('jwtToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  public getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToWs().getClient();
  }

  public validate({ email }: { email: string }): { email: string } {
    return {
      email
    };
  }
}
