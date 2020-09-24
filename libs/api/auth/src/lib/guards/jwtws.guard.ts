import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtWsGuard extends AuthGuard('jwtWs') {
  public getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToWs().getClient().handshake;
  }
}
