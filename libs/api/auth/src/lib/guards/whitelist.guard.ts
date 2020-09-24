import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthService } from '../services/auth.service';

@Injectable()
export class WhitelistGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const { query } = context
      .switchToHttp()
      .getRequest<{ query: { email?: string } }>();

    if (!query.email) {
      return false;
    }

    return this.authService.verifyWhitelist(query.email);
  }
}
