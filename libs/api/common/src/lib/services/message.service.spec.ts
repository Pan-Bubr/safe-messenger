import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '@safe-messenger/api/common';

import { MessageEntity } from '../entities/message-entity';
import { MessageService } from './message.service';

const MockMessageRepository = {
  find: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

const MockUserService = {
  findOne: jest.fn()
};

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: MockMessageRepository
        },
        {
          provide: UserService,
          useValue: MockUserService
        }
      ]
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  describe('getMessages()', () => {
    it('should be defined', async () => {
      MockUserService.findOne.mockImplementation((email: string) => ({
        email
      }));

      const mockMessages = [{}];

      MockMessageRepository.find.mockImplementation(() => mockMessages);
      MockMessageRepository.remove.mockImplementation(() => mockMessages);

      const result = await service.getMessages('mockUser', 'mockTarget');

      expect(result).toEqual(mockMessages);
    });
  });

  describe('saveMessage()', () => {
    it('should save message', async () => {
      MockUserService.findOne.mockImplementation((email: string) => ({
        email
      }));

      MockMessageRepository.save.mockImplementation(message => message);
      const result = await service.saveMessage({} as any, 'mockSender');

      expect(result).toEqual({
        content: undefined,
        recipient: {
          email: undefined
        },
        sender: {
          email: 'mockSender'
        },
        sessionId: undefined
      });
    });
  });
});
