import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import {
  AuthInterceptor,
  ClientCommonModule
} from '@safe-messenger/client/common';
import { ClientCryptoModule } from '@safe-messenger/client/crypto';

import { ChatPageComponent } from './chat-page/chat-page.component';
import { ChatGuard } from './guards/chat.guard';
import { SessionResolver } from './guards/session-resolver.service';
import { ChatService } from './services/chat.service';
import { SocketService } from './services/socket-io.service';

export const clientChatRoutes: Route[] = [
  {
    path: ':email',
    component: ChatPageComponent,
    canActivate: [ChatGuard],
    resolve: {
      sessionId: SessionResolver
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ClientCommonModule,
    ClientCryptoModule,
    RouterModule.forChild(clientChatRoutes),
    ReactiveFormsModule
  ],
  declarations: [ChatPageComponent],
  providers: [
    ChatService,
    SocketService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class ClientChatModule {}
