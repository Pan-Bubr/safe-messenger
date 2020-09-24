import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyWhitelist', () => {
    it('should reject mail addresses that are not whitelisted', () => {});

    it('should accept mail addresses that are whitelisted', () => {});
  });

  describe('sendAuthRequest', () => {
    it('should send a mail with an authorization code to a given email', () => {});

    it('should add code to the redis database', () => {});
  });

  describe('validateCode', () => {
    it('should validate the authentication code', () => {});

    it('should respond with a session key', () => {});
  });
});
