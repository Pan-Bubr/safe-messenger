import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { EncryptedMessage } from '@safe-messenger/api-interfaces';
import { JwtWsGuard } from '@safe-messenger/api/auth';
import { ConnectionService, MessageService } from '@safe-messenger/api/common';

import { Server, Socket } from 'socket.io';

@UseGuards(JwtWsGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() public server: Server;
  private readonly logger: Logger = new Logger('AppGateway');

  constructor(
    private readonly messageService: MessageService,
    private readonly connectionService: ConnectionService
  ) {}

  public readonly connected: { [key: string]: string } = {};

  @SubscribeMessage('join')
  public handleJoin(
    client: Socket & { handshake: { user: { email: string } } }
  ): void {
    this.connected[client.id] = client.handshake.user.email;

    this.logger.log(`${client.handshake.user.email} joined`);
    client
      .join(client.handshake.user.email)
      .emit('join', `${client.handshake.user.email} joined!`);
  }

  @SubscribeMessage('leave')
  public handleLeave(
    client: Socket & { handshake: { user: { email: string } } }
  ): void {
    this.connected[client.id] = null;

    client.leaveAll();
  }

  @SubscribeMessage('message')
  public async handleMessage(
    client: Socket & { handshake: { user: { email: string } } },
    message: EncryptedMessage
  ): Promise<void> {
    const userEmail = client.handshake.user.email;

    if (
      await this.connectionService.canTalk(userEmail, message.recipientEmail)
    ) {
      if (Object.values(this.connected).includes(message.recipientEmail)) {
        this.server.in(message.recipientEmail).emit('message', {
          content: message.content,
          senderEmail: message.senderEmail,
          recipientEmail: message.recipientEmail,
          sessionId: message.sessionId,
          sentAt: new Date()
        });
      } else {
        await this.messageService.saveMessage(message, userEmail);
      }
    }
  }

  public handleDisconnect(client: Socket): void {
    client.leaveAll();

    this.connected[client.id] = null;
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  public handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
