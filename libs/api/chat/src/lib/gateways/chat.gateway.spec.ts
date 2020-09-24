import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService, MessageService } from '@safe-messenger/api/common';

import { ChatGateway } from './chat.gateway';

describe('Auth Controller', () => {
  let gateway: ChatGateway;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ChatGateway,
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
            ]),
            saveMessage: jest.fn()
          }
        },
        {
          provide: ConnectionService,
          useValue: {
            canTalk: jest.fn(() => true)
          }
        }
      ]
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  describe('join', () => {
    it('should handle join', () => {
      const mockEmit = jest.fn();
      const mockJoin = jest.fn(() => ({
        emit: mockEmit
      }));
      const mockClient = {
        join: mockJoin,
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;
      gateway.handleJoin(mockClient);

      expect(mockEmit).toBeCalled();
    });
  });

  describe('leave', () => {
    it('should handle leave', () => {
      const mockClient = {
        leaveAll: jest.fn(),
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;
      gateway.handleLeave(mockClient);

      expect(mockClient.leaveAll).toBeCalled();
    });
  });

  describe('message', () => {
    it('should abort if users cannot talk', async () => {
      const mockClient = {
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;

      (module.get(ConnectionService).canTalk as jest.Mock).mockImplementationOnce(() => false);
      await gateway.handleMessage(mockClient, {} as any);

      expect( (module.get(MessageService).saveMessage as jest.Mock)).not.toBeCalled()
    });

    it('should save message if recipient is offline', async () => {
      const mockClient = {
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;

      await gateway.handleMessage(mockClient, {
        recipientEmail: 'targetEmail'
      } as any);

      expect((module.get(MessageService).saveMessage as jest.Mock)).toBeCalled();
    });

    it('should send message if recipient is online', async () => {
      const mockClient = {
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;

      gateway.server = {
        in: jest.fn(() => ({
          emit: jest.fn()
        }))
      } as any;
      gateway.connected['targetId'] = 'targetEmail';

      await gateway.handleMessage(mockClient, {
        recipientEmail: 'targetEmail'
      } as any);

      expect(gateway.server.in).toBeCalled();
    });
  });


  describe('handleDisconnect', () => {
    it('should handle disconnect', () => {
      const mockClient = {
        leaveAll: jest.fn(),
        handshake: {
          user: {
            email: 'mockUser'
          }
        }
      } as any;
      gateway.handleDisconnect(mockClient);

      expect(mockClient.leaveAll).toBeCalled();
    });
  });

  describe('handleConnection', () => {
    it('should handle connection', () => {

      gateway.handleConnection({} as any);

      expect(true).toBe(true);
    });
  });
});
