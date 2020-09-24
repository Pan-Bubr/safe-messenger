import { async, TestBed } from '@angular/core/testing';

import { ClientCryptoModule } from './client-crypto.module';

describe('ClientCryptoModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientCryptoModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientCryptoModule).toBeDefined();
  });
});
