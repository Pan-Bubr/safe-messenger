import { async, TestBed } from '@angular/core/testing';

import { ClientCommonModule } from './client-common.module';

describe('ClientCommonModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientCommonModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientCommonModule).toBeDefined();
  });
});
