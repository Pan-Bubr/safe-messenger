import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-local';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor() {
    super({
      usernameField: 'login'
    });
  }

  public validate(user: string, password: string): boolean {
    return user === 'admin' && process.env.ADMIN_PASSWORD === password;
  }
}
