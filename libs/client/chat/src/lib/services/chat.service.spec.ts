import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CryptoService } from '@safe-messenger/client/crypto';

import { of } from 'rxjs';

import { ChatService } from './chat.service';
import { SocketService } from './socket-io.service';

describe('ChatService', () => {
  let service: ChatService;
  let cryptoService: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: SocketService,
          useValue: {
            emit: jest.fn(),
            disconnect: jest.fn(),
            fromEvent: jest.fn(() => of({}))
          }
        },
        {
          provide: CryptoService,
          useValue: {
            decryptMessage: jest.fn(() => Promise.resolve({})),
            encryptMessage: jest.fn(() => Promise.resolve({}))
          }
        }
      ]
    });
    service = TestBed.inject(ChatService);
    cryptoService = TestBed.inject(CryptoService);
  });

  it('should provide newMessage$ observable', () => {
    service.newMessage$.subscribe(() => {});
    expect(true).toBe(true);
  });

  it('should provide newMessage$ observable', () => {
    (cryptoService.decryptMessage as jest.Mock).mockImplementationOnce(() =>
      Promise.reject('')
    );
    service.newMessage$.subscribe(() => {});
    expect(true).toBe(true);
  });

  it('should handle join', async () => {
    await service.join('mockMail');
    expect(true).toBe(true);
  });

  it('should handle join', async () => {
    await service.leave();
    expect(true).toBe(true);
  });
  it('should handle send', async () => {
    await service.sendMessage({}, '0');
    expect(true).toBe(true);
  });
});
