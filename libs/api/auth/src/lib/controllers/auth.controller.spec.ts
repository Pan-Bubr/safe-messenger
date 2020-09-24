import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService, UserService } from '@safe-messenger/api/common';

import { AuthService } from '../services/auth.service';
import { AuthController } from './auth.controller';

describe('Auth Controller', () => {
  let controller: AuthController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            sendAuthCodeMail: jest.fn(() => Promise.resolve(true)),
            login: jest.fn(() => 'mockJWT'),
            loginAdmin: jest.fn(() => 'mockAdminJWT')
          }
        },
        {
          provide: UserService,
          useValue: {
            save: jest.fn()
          }
        },
        { provide: ConnectionService, useValue: {} }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('/auth/request', () => {
    it('should request AuthCode mail', async () => {
      const response = await controller.getUser({ email: 'mockMail' });

      expect(response).toEqual({ success: true });
    });
  });

  describe('/auth/verify', () => {
    it('should return signed JWT token', () => {
      expect(controller.getCode({ email: 'mockMail' })).toEqual({
        expiresIn: 30000,
        success: true,
        token: 'mockJWT'
      });
    });
  });

  describe('/auth/admin', () => {
    it('should return signed JWT token for admin', () => {
      expect(controller.loginAdmin()).toEqual({
        expiresIn: 30000,
        success: true,
        token: 'mockAdminJWT'
      });
    });
  });
});
