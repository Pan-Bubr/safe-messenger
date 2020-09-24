import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpTest: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AdminService);
    httpTest = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTest.verify();
  });

  it('addUser() should add user', async() => {
    const result = service.addUser('mockMail', 'mockDisplay').toPromise();

    const req = httpTest.expectOne('/api/admin/add');
    req.flush('mock');

    expect(await result).toBe('mock');
  });

  it('userList() should list users', async() => {
    const result = service.userList().toPromise();

    const req = httpTest.expectOne('/api/admin/list');
    req.flush('mock');

    expect(await result).toBe('mock');
  });

  it('remove() should list users', async() => {
    const result = service.remove('mockMail').toPromise();

    const req = httpTest.expectOne('/api/admin/remove');
    req.flush('mock');

    expect(await result).toBe('mock');
  });
});
