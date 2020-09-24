import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from '../services/auth.service';
import { WhitelistGuard } from './whitelist.guard';

const MockAuthService = {
  verifyWhitelist: jest.fn()
};

describe('WhitelistGuard', () => {
  let guard: WhitelistGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhitelistGuard,
        { provide: AuthService, useValue: MockAuthService }
      ]
    }).compile();

    guard = module.get<WhitelistGuard>(WhitelistGuard);
  });

  it('should reject queries withous emails', async () => {
    const context = ({
      switchToHttp: () => ({
        getRequest: () => ({ query: {} })
      })
    } as unknown) as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(false);
  });

  it('should pass email query to authService.validateWhitelist', async () => {
    const context = ({
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            email: 'user@example.com'
          }
        })
      })
    } as unknown) as ExecutionContext;

    MockAuthService.verifyWhitelist.mockImplementationOnce(() =>
      Promise.resolve(true)
    );

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should accept whitelisted emails', async () => {
    const context = ({
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            email: 'user@example.com'
          }
        })
      })
    } as unknown) as ExecutionContext;

    MockAuthService.verifyWhitelist.mockImplementationOnce(() =>
      Promise.resolve(true)
    );

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should reject not whitelisted emails', async () => {
    const context = ({
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            email: 'user@example.com'
          }
        })
      })
    } as unknown) as ExecutionContext;

    MockAuthService.verifyWhitelist.mockImplementationOnce(() =>
      Promise.resolve(false)
    );

    expect(await guard.canActivate(context)).toBe(false);
  });
});
