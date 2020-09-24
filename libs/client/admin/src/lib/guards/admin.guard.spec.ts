import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AdminAuthService } from '../services/admin-auth.service';
import { AdminGuard } from './admin.guard';

describe('AdminService', () => {
  let guard: AdminGuard;
  let authService: AdminAuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: AdminAuthService,
        useValue: {
          isLoggedIn: jest.fn()
        }
      }, {
        provide: Router,
        useValue: {
          navigateByUrl: jest.fn()
        }
      }]
    });
    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AdminAuthService);
    router = TestBed.inject(Router);
  });

  it('should activate when user is logged in', async () => {
    (authService.isLoggedIn as jest.Mock).mockImplementationOnce(() => true);

    const result = await guard.canActivate();

    expect(result).toBeTruthy();
  });

  it('should activate when user is logged in', async () => {
    (authService.isLoggedIn as jest.Mock).mockImplementationOnce(() => false);
    const result = await guard.canActivate();

    expect(router.navigateByUrl).toBeCalledWith('/admin/login');
  });
});
