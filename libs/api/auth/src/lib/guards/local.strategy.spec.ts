import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { LocalStrategy } from './local.strategy';

const MockAuthService = {
  validateCode: jest.fn()
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: MockAuthService }
      ]
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  describe('validate()', () => {
    it('should ask authService to validate code from POST body', async () => {
      MockAuthService.validateCode.mockImplementationOnce(() => true);

      const result = await strategy.validate('mockEmail', 'code');
      expect(result).toBe(true);
    });
  });
});
