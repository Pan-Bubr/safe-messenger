import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStatus } from '@safe-messenger/api-interfaces';
import { ConnectionService } from '@safe-messenger/api/common';

import { ContactsController } from './contacts.controller';

describe('Contacts Controller', () => {
  let controller: ContactsController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ConnectionService,
          useValue: {
            getConnections: jest.fn(),
            getInvitations: jest.fn(),
            canTalk: jest.fn(),
            getKeyBundle: jest.fn(),
            createConnection: jest.fn(),
            modifyConnection: jest.fn(),
            deleteConnection: jest.fn(),
            findConnection: jest.fn(),
            removeConnection: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
  });

  describe('/contacts/list', () => {
    it('should return connections of the user', async () => {
      const { getConnections } = module.get(ConnectionService);

      getConnections.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      await controller.getContacts(req);

      expect(getConnections).toBeCalledWith(req.user.email);
    });
  });

  describe('/contacts/invitations', () => {
    it('should return invitations of the user', async () => {
      const { getInvitations } = module.get(ConnectionService);

      getInvitations.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      await controller.getInvitations(req);

      expect(getInvitations).toBeCalledWith(req.user.email);
    });
  });

  describe('/contacts/check', () => {
    it('should check if users can talk', async () => {
      const { canTalk } = module.get(ConnectionService);

      canTalk.mockImplementationOnce(() => Promise.resolve());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const query = {
        target: 'mockTarget'
      };

      await controller.checkContact(req, query);

      expect(canTalk).toBeCalledWith(req.user.email, query.target);
    });

    it('should break if users can talk', async () => {
      const { canTalk } = module.get(ConnectionService);

      canTalk.mockImplementationOnce(() => Promise.reject('test'));

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const query = {
        target: 'mockTarget'
      };

      await controller.checkContact(req, query).catch(() => {

      });

      expect(true).toBe(true);
    });
  });

  describe('/contacts/key', () => {
    it('should get partner key', async () => {
      const { getKeyBundle } = module.get(ConnectionService);

      getKeyBundle.mockImplementationOnce(() => Promise.resolve());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const query = {
        partner: 'mockTarget'
      };

      await controller.getKeyBundle(req, query);

      expect(getKeyBundle).toBeCalledWith(query.partner, req.user.email);
    });

    it('should fail', async () => {
      const { getKeyBundle } = module.get(ConnectionService);

      getKeyBundle.mockImplementationOnce(() => Promise.reject());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const query = {
        partner: 'mockTarget'
      };

      await controller.getKeyBundle(req, query).catch(() => {});

      expect(true).toBe(true);
    });
  });

  describe('/contacts/invite', () => {
    it('should request invitation of the user', async () => {
      const { createConnection } = module.get(ConnectionService);

      createConnection.mockImplementationOnce(() => Promise.resolve());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        target: 'mockTarget',
        keyBundle: {} as any
      };

      await controller.requestInvite(req, body);

      expect(createConnection).toBeCalledWith(req.user.email, body.target, body.keyBundle);
    });

    it('should fail', async () => {
      const { createConnection } = module.get(ConnectionService);

      createConnection.mockImplementationOnce(() => Promise.reject());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        target: 'mockTarget',
        keyBundle: {} as any
      };

      await controller.requestInvite(req, body).catch(() => {});

      expect(true).toBe(true);
    });
  });

  describe('/contacts/reject', () => {
    it('should change the status of invitation', async () => {
      const { modifyConnection } = module.get(ConnectionService);

      modifyConnection.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        initiator: 'mockInitiator',
        status: ConnectionStatus.BLOCKED
      };

      await controller.rejectInvitation(req, body);

      expect(modifyConnection).toBeCalledWith(
        body.initiator,
        req.user.email,
        body.status
      );
    });

    it('should ignore blocked connections', async () => {
      const { modifyConnection } = module.get(ConnectionService);

      modifyConnection.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        initiator: 'mockInitiator',
        status: ConnectionStatus.ACCEPTED
      };

      const result = await controller.rejectInvitation(req, body);

      expect(result).toBe(false);
    });
  });

  describe('/contacts/accept', () => {
    it('should change the status of invitation', async () => {
      const { modifyConnection } = module.get(ConnectionService);

      modifyConnection.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        initiator: 'mockInitiator',
        handshake: 'handshake'
      };

      await controller.acceptInvitation(req, body);

      expect(modifyConnection).toBeCalledWith(
        body.initiator,
        req.user.email,
        ConnectionStatus.ACCEPTED,
        body.handshake
      );
    });
  });

  describe('/contacts/delete', () => {
    it('should change the status of invitation', async () => {
      const { deleteConnection } = module.get(ConnectionService);

      deleteConnection.mockImplementationOnce(() => {});

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        target: 'mockTarget'
      };

      await controller.cancelInvitation(req, body);

      expect(deleteConnection).toBeCalledWith(
        req.user.email,
        body.target
      );
    });
  });

  describe('/contacts/restart', () => {
    it('should delete the invitation', async () => {
      const { findConnection, removeConnection, createConnection } = module.get(ConnectionService);

      findConnection.mockImplementationOnce(() => Promise.resolve('mockConnection'));

      removeConnection.mockImplementationOnce(() => Promise.resolve());

      const req = {
        user: {
          email: 'mockEmail'
        }
      };

      const body = {
        target: 'mockTarget',
        keyBundle: {} as any
      };

      await controller.restartConnection(req, body);

      expect(removeConnection).toBeCalledWith('mockConnection');
    });
  });
});
