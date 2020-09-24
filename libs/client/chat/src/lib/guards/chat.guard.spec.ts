import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { of } from 'rxjs';

import { ChatService } from '../services/chat.service';
import { ChatGuard } from './chat.guard';

describe('ChatGuard', () => {
  let guard: ChatGuard;
  let chatService: ChatService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ChatService,
          useValue: {
            canTalk: jest.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn()
          }
        }
      ]
    });
    guard = TestBed.inject(ChatGuard);
    chatService = TestBed.inject(ChatService);
    router = TestBed.inject(Router);
  });

  it('should activate when users can talk', async () => {
    (chatService.canTalk as jest.Mock).mockImplementationOnce(() => of(true));

    const result = await guard
      .canActivate({ params: { email: 'mockEmail' } } as any)
      .toPromise();

    expect(result).toBeTruthy();
  });

  it('should not activate when users can not talk', async () => {
    (chatService.canTalk as jest.Mock).mockImplementationOnce(() => of(false));
    const result = await guard
      .canActivate({ params: { email: 'mockEmail' } } as any)
      .toPromise();

    expect(router.navigateByUrl).toBeCalledWith('home');
  });
});
