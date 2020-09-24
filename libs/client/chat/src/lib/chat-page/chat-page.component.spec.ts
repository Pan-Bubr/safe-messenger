import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientChatModule } from '@safe-messenger/client/chat';
import { ContactsService } from '@safe-messenger/client/common';

import { of } from 'rxjs';
import { Shallow } from 'shallow-render';

import { ChatService } from '../services/chat.service';
import { ChatPageComponent } from './chat-page.component';

describe('ChatPageComponent', () => {
  let shallow: Shallow<ChatPageComponent>;

  beforeEach(() => {
    shallow = new Shallow(ChatPageComponent, ClientChatModule)
      .import(HttpClientTestingModule, ReactiveFormsModule)
      .provideMock(
        {
          provide: Router,
          useValue: {
            navigateByUrl: jest.fn(),
            navigate: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ email: 'mockEmail' }),
            snapshot: {
              data: {
                sessionId: '1'
              }
            }
          }
        },
        {
          provide: ChatService,
          useValue: {
            join: jest.fn(),
            leave: jest.fn(),
            getHistory: jest.fn(() => of([])),
            getServerMessages: jest.fn(),
            sendMessage: jest.fn(),
            newMessage$: of({
              content: 'test',
              sessionId: 1,
              recipientEmail: 'mockTarget',
              senderEmail: 'mockUser'
            })
          }
        },
        {
          provide: ContactsService,
          useValue: {
            resetConnection: jest.fn(() => of(''))
          }
        }
      );
  });

  it('should match snapshot', async () => {
    const { fixture } = await shallow.render();

    expect(fixture).toMatchSnapshot();
  });

  it('ngOnInit()', async () => {
    const { instance } = await shallow.render();

    await instance.ngOnInit();
    await instance.ngOnDestroy();
  });

  it('sendMessage() should send Message', async () => {
    const { instance, get } = await shallow.render();

    instance.sendMessage({ message: 'text' });

    expect(get(ChatService).sendMessage).toBeCalled();
  });

  it('sendMessage() should not send empty Message', async () => {
    const { instance, get } = await shallow.render();

    instance.sendMessage({ message: '   ' });

    expect(get(ChatService).sendMessage).not.toBeCalled();
  });

  it('returnToHomepage() should return to homepage', async () => {
    const { instance, get } = await shallow.render();

    await instance.returnToHomepage();

    expect(get(Router).navigate).toBeCalled();
  });

  it('returnToHomepage() should return to homepage', async () => {
    const { instance, get } = await shallow.render();

    instance.resetConnection();

    expect(get(Router).navigateByUrl).toBeCalled();
  });
});
