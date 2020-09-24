import { TestBed } from '@angular/core/testing';
import { CryptoService } from '@safe-messenger/client/crypto';

import { of } from 'rxjs';

import { ChatService } from '../services/chat.service';
import { ChatGuard } from './chat.guard';
import { SessionResolver } from './session-resolver.service';

describe('SessionResolver', () => {
  let resolver: SessionResolver;
  let chatService: ChatService;
  let cryptoService: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ChatService,
          useValue: {
            getSavedMessages: jest.fn()
          }
        },
        {
          provide: CryptoService,
          useValue: {
            getSession: jest.fn(),
            getConnectionKeys: jest.fn(),
            initializeSessionFromHandshake: jest.fn()
          }
        }
      ]
    });
    resolver = TestBed.inject(SessionResolver);
    chatService = TestBed.inject(ChatService);
    cryptoService = TestBed.inject(CryptoService);
  });

  it('should resolve when users can talk', async () => {
    (chatService.getSavedMessages as jest.Mock).mockImplementationOnce(() => [
      {
        sentAt: new Date(),
        recipientEmail: 'mockRecipient',
        content: 'mockContent',
        sessionId: '1'
      }
    ]);

    const result = await resolver.resolve({
      params: { email: 'mockEmail' }
    } as any);

    expect(result).toBeTruthy();
  });

  it('should not activate when users can not talk', async () => {
    (chatService.getSavedMessages as jest.Mock).mockImplementationOnce(
      () => []
    );

    const result = await resolver.resolve({
      params: { email: 'mockEmail' }
    } as any);

    expect(result).toBeTruthy();
  });

  it('should not activate when users can not talk', async () => {
    (chatService.getSavedMessages as jest.Mock).mockImplementationOnce(
      () => []
    );
    (cryptoService.getSession as jest.Mock).mockImplementationOnce(() =>
      Promise.reject()
    );
    (cryptoService.getConnectionKeys as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ handshake: '' })
    );

    const result = await resolver.resolve({
      params: { email: 'mockEmail' }
    } as any);

    expect(result).toBeTruthy();
  });
});
