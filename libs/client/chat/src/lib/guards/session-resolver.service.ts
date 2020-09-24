import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { CryptoService } from '@safe-messenger/client/crypto';

import { ChatService } from '../services/chat.service';

@Injectable({
  providedIn: 'root'
})
export class SessionResolver implements Resolve<string> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly chatService: ChatService
  ) {}

  public async resolve(next: ActivatedRouteSnapshot): Promise<string> {
    const email = next.params.email;
    const messages = this.chatService.getSavedMessages(email);

    if (messages && messages[0]) {
      return messages[0].sessionId;
    }

    try {
      const lastSession = await this.cryptoService.getSession(email, '0');
    } catch (e) {
      const keys = await this.cryptoService.getConnectionKeys(email);

      const newSession = await this.cryptoService.initializeSessionFromHandshake(
        email,
        keys.handshake
      );
    }

    return '0';
  }
}
