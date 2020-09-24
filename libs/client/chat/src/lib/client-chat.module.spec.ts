import { async, TestBed } from '@angular/core/testing';

import { ClientChatModule } from './client-chat.module';

describe('ClientChatModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClientChatModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ClientChatModule).toBeDefined();
  });
});
