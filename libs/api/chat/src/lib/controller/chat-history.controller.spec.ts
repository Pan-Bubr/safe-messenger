import { Test, TestingModule } from '@nestjs/testing';
import {
  MessageService,
} from '@safe-messenger/api/common';

import { ChatHistoryController } from './chat-history.controller';

describe('Auth Controller', () => {
  let controller: ChatHistoryController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ChatHistoryController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            getMessages: jest.fn(() => [
              {
                id: 'mockId',
                sender: {
                  email: 'mockSender'
                },
                recipient: {
                  email: 'mockRecipient'
                },
                sentAt: 'date',
                content: 'content',
                sessionId: 'sessionId'
              }
            ])
          }
        }
      ]
    }).compile();

    controller = module.get<ChatHistoryController>(ChatHistoryController);
  });

  describe('/history/chat', () => {
    it('should request chat history', async () => {
      const response = await controller.getHistory(
        { user: { email: 'mockEmail' } },
        { contact: 'mockContact' }
      );

      expect(response).toEqual([
        {
          id: 'mockId',
          senderEmail: 'mockSender',
          recipientEmail: 'mockRecipient',
          sentAt: 'date',
          content: 'content',
          sessionId: 'sessionId'
        }
      ]);
    });
  });
});
