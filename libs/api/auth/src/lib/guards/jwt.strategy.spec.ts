import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { JwtStrategy } from './jwt.strategy';

process.env = { JWT_SECRET: 'mockSecret' };

const MockAuthService = {
  validateCode: jest.fn()
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: MockAuthService }
      ]
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate()', () => {
    it('should ask authService to validate code from POST body', () => {
      MockAuthService.validateCode.mockImplementationOnce(() => true);

      const result = strategy.validate({ email: 'mockEmail' });
      expect(result).toEqual({ email: 'mockEmail' });
    });
  });
});
