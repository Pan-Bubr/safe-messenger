import { async, TestBed } from '@angular/core/testing';

import { ClientLoginModule } from './client-login.module';

describe('ClientLoginModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientLoginModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientLoginModule).toBeDefined();
  });
});
