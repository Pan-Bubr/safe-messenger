import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/auth', () => {
    it('should reject authentication request that are not whitelisted', () => {});

    it('should provide confirmation of authentication request', () => {});
  });

  describe('/code', () => {
    it('should reject invalid code for a given user', () => {});

    it('should provide user with a valid session token', () => {});
  });
});
