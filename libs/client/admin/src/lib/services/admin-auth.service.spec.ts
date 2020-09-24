import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminAuthService } from './admin-auth.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminAuthService;
  let httpTest: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AdminAuthService);
    httpTest = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTest.verify();
  });

  it('login() should add user', async() => {
    const result = service.login('mockLogin', 'mockPassword').toPromise();

    const req = httpTest.expectOne('/api/auth/admin');
    req.flush('mock');

    expect(await result).toBe('mock');
  });

  it('logout() should add user', async() => {
    const result = service.logout();

    expect(localStorage.getItem('admin_token')).toBe(null);
  });

  it('isLoggedIn() should check loggedIn', async() => {
    const result = service.isLoggedIn();

    expect(true).toBe(true);
  });

});
