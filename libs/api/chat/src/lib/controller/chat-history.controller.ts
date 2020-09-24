import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { EncryptedMessage } from '@safe-messenger/api-interfaces';
import { JwtGuard } from '@safe-messenger/api/auth';
import { MessageService } from '@safe-messenger/api/common';

@Controller('history')
export class ChatHistoryController {
  constructor(private readonly messageService: MessageService) {}

  @Get('chat')
  @UseGuards(JwtGuard)
  public async getHistory(
    @Request() req: { user: { email: string } },
    @Query() { contact }: { contact: string }
  ): Promise<EncryptedMessage[]> {
    const messages = await this.messageService.getMessages(
      req.user.email,
      contact
    );

    return messages
      .map(message => ({
        id: message.id,
        senderEmail: message.sender.email,
        recipientEmail: message.recipient.email,
        sentAt: message.sentAt,
        content: message.content,
        sessionId: message.sessionId
      }))
      .reverse();
  }
}
