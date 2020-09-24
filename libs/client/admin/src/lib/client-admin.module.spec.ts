import { async, TestBed } from '@angular/core/testing';

import { ClientAdminModule } from './client-admin.module';

describe('ClientAdminModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientAdminModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientAdminModule).toBeDefined();
  });
});
