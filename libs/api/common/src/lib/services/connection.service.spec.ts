import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConnectionStatus } from '@safe-messenger/api-interfaces';
import { ConnectionEntity, UserService } from '@safe-messenger/api/common';

import { ConnectionService } from './connection.service';

const MockConnectionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
};

const MockUserService = {
  findOne: jest.fn()
};

describe('ConnectionService', () => {
  let service: ConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(ConnectionEntity),
          useValue: MockConnectionRepository
        },
        {
          provide: UserService,
          useValue: MockUserService
        },
        ConnectionService
      ]
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
  });

  afterEach(() => {
    MockConnectionRepository.findOne.mockReset();
    MockConnectionRepository.find.mockReset();
    MockConnectionRepository.remove.mockReset();
    MockUserService.findOne.mockReset();
  });

  describe('createConnection()', () => {
    it('should return existing connection if user initiated it', async () => {
      MockUserService.findOne.mockImplementation(email => ({
        email
      }));

      MockConnectionRepository.findOne.mockImplementationOnce(
        ({
          initiator,
          target
        }: {
          initiator: { email: string };
          target: { email: string };
        }) => ({
          initiator,
          target
        })
      );
      MockConnectionRepository.findOne.mockImplementationOnce(() => null);
      const initiatorMock = 'mockInitiator';
      const targetMock = 'mockTarget';
      const keyBundle = {} as any;

      const result = await service.createConnection(
        initiatorMock,
        targetMock,
        keyBundle
      );

      expect(MockUserService.findOne).toBeCalledTimes(4);
      expect(MockConnectionRepository.findOne).toBeCalledTimes(2);
      expect(result).toEqual({
        initiator: { email: initiatorMock },
        target: { email: targetMock }
      });
    });

    it('should return existing connection if user received it', async () => {
      MockUserService.findOne.mockImplementation(email => ({
        email
      }));

      MockConnectionRepository.findOne.mockImplementationOnce(() => null);

      MockConnectionRepository.findOne.mockImplementationOnce(
        ({
          initiator,
          target
        }: {
          initiator: { email: string };
          target: { email: string };
        }) => ({
          initiator,
          target
        })
      );

      const initiatorMock = 'mockInitiator';
      const targetMock = 'mockTarget';
      const keyBundle = {} as any;

      const result = await service.createConnection(
        initiatorMock,
        targetMock,
        keyBundle
      );

      expect(MockUserService.findOne).toBeCalledTimes(4);
      expect(MockConnectionRepository.findOne).toBeCalledTimes(2);
      expect(result).toEqual({
        initiator: { email: targetMock },
        target: { email: initiatorMock }
      });
    });

    it('should create new connection if the is no previous one', async () => {
      MockUserService.findOne.mockImplementation(email => ({
        email
      }));

      MockConnectionRepository.findOne.mockImplementation(() => null);

      const initiatorMock = 'mockInitiator';
      const targetMock = 'mockTarget';
      const keyBundle = {} as any;

      const mockConnection = {
        initiator: { email: initiatorMock },
        target: { email: targetMock }
      };

      MockConnectionRepository.save.mockImplementationOnce(
        () => mockConnection
      );

      const result = await service.createConnection(
        initiatorMock,
        targetMock,
        keyBundle
      );

      expect(MockUserService.findOne).toBeCalledTimes(4);
      expect(MockConnectionRepository.findOne).toBeCalledTimes(2);
      expect(MockConnectionRepository.save).toBeCalledWith({
        initiator: { email: initiatorMock },
        target: { email: targetMock },
        status: ConnectionStatus.PENDING
      });
      expect(result).toEqual(mockConnection);
    });
  });

  describe('findConnection()', () => {
    it('should return connection between users', async () => {
      MockUserService.findOne.mockImplementation(email => ({
        email
      }));

      MockConnectionRepository.findOne.mockImplementationOnce(
        ({
          initiator,
          target
        }: {
          initiator: { email: string };
          target: { email: string };
        }) => ({
          initiator,
          target
        })
      );

      const result = await service.findConnection('mockUser', 'mockTarget');

      expect(result).toEqual({
        initiator: {
          email: 'mockUser'
        },
        target: {
          email: 'mockTarget'
        }
      });
    });
  });

  describe('canTalk()', () => {
    it('should check if users can talk', async () => {
      MockUserService.findOne.mockImplementation(email => ({
        email
      }));

      MockConnectionRepository.findOne.mockImplementationOnce(
        ({
          initiator,
          target
        }: {
          initiator: { email: string };
          target: { email: string };
        }) => ({
          initiator,
          target,
          status: ConnectionStatus.ACCEPTED
        })
      );

      const result = await service.canTalk('mockUser', 'mockTarget');
      expect(result).toBe(true);
    });
  });

  describe('getConnections()', () => {
    it('should return contacts of a user', async () => {
      const mockUser = { email: 'mockUserEmail' };
      MockUserService.findOne.mockImplementationOnce(() => mockUser);

      const mockConnection = {
        initiator: 'mockInitiator',
        target: 'mockTarget'
      };
      MockConnectionRepository.find.mockImplementation(() =>
        Promise.resolve([mockConnection])
      );

      const result = await service.getConnections('mockEmail');

      expect(MockConnectionRepository.find).toBeCalledWith({
        relations: ['target', 'initiator'],
        where: {
          target: mockUser
        }
      });

      expect(MockConnectionRepository.find).toBeCalledWith({
        relations: ['target', 'initiator'],
        where: {
          initiator: mockUser
        }
      });

      expect(result).toEqual({
        initiated: [mockConnection.target],
        received: [mockConnection.initiator]
      });
    });
  });

  describe('getInvitations()', () => {
    it('should return invitations of a user', async () => {
      const mockUser = { email: 'mockUserEmail' };
      MockUserService.findOne.mockImplementationOnce(() => mockUser);

      const mockConnection = {
        initiator: { email: 'mockInitiator' },
        target: { email: 'mockTarget' }
      };
      MockConnectionRepository.find.mockImplementation(() =>
        Promise.resolve([mockConnection])
      );

      const result = await service.getInvitations('mockEmail');

      expect(MockConnectionRepository.find).toBeCalledWith({
        relations: ['target', 'initiator'],
        where: {
          target: mockUser,
          status: ConnectionStatus.PENDING
        }
      });

      expect(MockConnectionRepository.find).toBeCalledWith({
        relations: ['target', 'initiator'],
        where: {
          initiator: mockUser,
          status: ConnectionStatus.PENDING
        }
      });

      expect(result).toEqual({
        sent: [mockConnection.target.email],
        received: [mockConnection.initiator.email]
      });
    });
  });

  describe('modifyConnection()', () => {
    it('should change status of a connection', async () => {
      MockUserService.findOne.mockImplementation((email: string) => ({
        email
      }));
      const mockResult = { affected: 1 };
      MockConnectionRepository.update.mockImplementationOnce(() => mockResult);

      const initiatorMock = 'mockInitiator';
      const targetMock = 'mockTarget';

      const result = await service.modifyConnection(
        initiatorMock,
        targetMock,
        ConnectionStatus.REJECTED
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteConnection()', () => {
    it('should delete connection from database', async () => {
      MockUserService.findOne.mockImplementation((email: string) => ({
        email
      }));
      MockConnectionRepository.findOne.mockImplementation(() => mockConnection);

      const mockConnection = {
        initiator: 'mockInitiator',
        target: 'mockTarget'
      };

      MockConnectionRepository.remove.mockImplementationOnce(
        () => mockConnection
      );

      const result = await service.deleteConnection(
        mockConnection.initiator,
        mockConnection.target
      );

      expect(result).toEqual(mockConnection);
    });
  });

  describe('getKeyBundle()', () => {
    it('should return keyBundle of target', async () => {
      MockUserService.findOne.mockImplementation((email: string) => ({
        email
      }));

      const mockBundle = {
        handshake: null,
        keyBundle: {
          id: undefined,
          key: undefined
        }
      };

      const mockConnection = {
        initiator: 'mockInitiator',
        target: 'mockTarget',
        ...mockBundle
      };

      MockConnectionRepository.findOne.mockImplementation(() => mockConnection);

      MockConnectionRepository.remove.mockImplementationOnce(
        () => mockConnection
      );

      const result = await service.getKeyBundle(
        mockConnection.initiator,
        mockConnection.target
      );

      expect(result).toEqual(mockBundle);
    });
  });

  describe('removeConnection()', () => {
    it('should remove connection', async () => {
      const mockConnection = {
        initiator: 'mockInitiator',
        target: 'mockTarget',
      } as any;

      MockConnectionRepository.remove.mockImplementation(() => mockConnection);

      const result = await service.removeConnection(mockConnection);

      expect(result).toEqual(mockConnection);
    });
  });
});
