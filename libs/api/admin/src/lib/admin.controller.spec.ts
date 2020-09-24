import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@safe-messenger/api/common';

import { AdminController } from './admin.controller';

describe('Auth Controller', () => {
  let controller: AdminController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{
        provide: UserService,
        useValue: {
          save: jest.fn(() => 'ok'),
          findEmails: jest.fn(() => ['email']),
          delete: jest.fn(() => 'deleted')
        }
      }]
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  describe('/admin/add', () => {
    it('should add user', async () => {
      const response = await controller.addUser({ email: 'mockEmail', displayName: 'displayName' });

      expect(response).toEqual('ok');
    });
  });

  describe('/admin/list', () => {
    it('should list users', async () => {
      const response = await controller.getUsers({page: 0});

      expect(response).toEqual(['email']);
    });
  });

  describe('/admin/remove', () => {
    it('should remove user', async () => {
      const response = await controller.removeUser({email: 'mockEmail'});

      expect(response).toEqual('deleted');
    });
  });
});
