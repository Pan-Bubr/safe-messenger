import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@safe-messenger/client/login';

import { LoggedInGuard } from './logged-in.guard';

const MockAuthService = {
  isLoggedIn: jest.fn()
};

const MockRouter = {
  navigateByUrl: jest.fn()
};

describe('LoggedInGuard', () => {
  let guard: LoggedInGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        {
          provide: AuthService,
          useValue: MockAuthService
        },
        {
          provide: Router,
          useValue: MockRouter
        }
      ]
    });
    guard = TestBed.inject(LoggedInGuard);
    router = TestBed.inject(Router);
  });

  describe('canActivate()', () => {
    it('should return true when user is logged in', async () => {
      MockAuthService.isLoggedIn.mockImplementationOnce(() => true);

      const result = await guard.canActivate();

      expect(result).toBe(true);
      expect(MockAuthService.isLoggedIn).toBeCalled();
    });

    it('should redirect to /login when user is not logged in', async () => {
      MockAuthService.isLoggedIn.mockImplementationOnce(() => false);
      MockRouter.navigateByUrl.mockImplementationOnce(() => false);

      const result = await guard.canActivate();

      expect(result).toBe(false);
      expect(MockAuthService.isLoggedIn).toBeCalled();
      expect(MockRouter.navigateByUrl).toBeCalledWith('/login');
    });
  });
});
