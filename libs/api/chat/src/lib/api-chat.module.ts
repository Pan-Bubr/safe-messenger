import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { ApiCommonModule } from '@safe-messenger/api/common';

import { ChatHistoryController } from './controller/chat-history.controller';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [ApiCommonModule],
  controllers: [ChatHistoryController],
  providers: [ChatGateway],
  exports: []
})
export class ApiChatModule {}
