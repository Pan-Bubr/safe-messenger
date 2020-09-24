import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  EncryptedMessage,
  ErrorMessage,
  RawMessage
} from '@safe-messenger/api-interfaces';
import { CryptoService } from '@safe-messenger/client/crypto';

import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { SocketService } from './socket-io.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private readonly socket: SocketService,
    private readonly httpClient: HttpClient,
    private readonly cryptoService: CryptoService
  ) {}

  public targetEmail: string;

  private readonly sentMessages$: Subject<
    RawMessage | ErrorMessage
  > = new BehaviorSubject({} as RawMessage);

  private readonly serverMessages$: Subject<
    RawMessage | ErrorMessage
  > = new BehaviorSubject({} as RawMessage);

  private readonly receivedMessages$: Observable<
    RawMessage | ErrorMessage
  > = this.socket
    .fromEvent<EncryptedMessage>('message')
    .pipe(switchMap(message => this.decrypt(message)));

  public newMessage$: Observable<RawMessage | ErrorMessage> = merge(
    this.serverMessages$,
    this.sentMessages$,
    this.receivedMessages$
  );

  private decrypt(
    message: EncryptedMessage
  ): Promise<RawMessage | ErrorMessage> {
    return this.cryptoService
      .decryptMessage(this.targetEmail, message.sessionId, message.content)
      .then(
        content =>
          ({
            ...message,
            content
          } as RawMessage)
      )
      .then(decryptedMessage => {
        this.saveMessage(this.targetEmail, decryptedMessage);

        return decryptedMessage;
      })
      .catch(
        (error: Error): ErrorMessage => ({
          error,
          sentAt: new Date(),
          recipientEmail: '',
          content: '',
          sessionId: ''
        })
      );
  }

  public async join(targetEmail: string): Promise<void> {
    this.targetEmail = targetEmail;
    this.socket.emit('join', `User joined!`);
  }

  public async leave(): Promise<void> {
    this.socket.emit('leave', `User left!`);
    this.socket.disconnect();
  }

  public async sendMessage(
    message: Partial<RawMessage>,
    sessionId: string
  ): Promise<void> {
    this.saveMessage(
      message.recipientEmail,
      {
        senderEmail: localStorage.getItem('user'),
        ...message
      } as RawMessage,
      true
    );
    const content = await this.cryptoService.encryptMessage(
      message.recipientEmail,
      message.content,
      sessionId
    );
    this.socket.emit('message', {
      ...message,
      content
    });
  }

  public getServerMessages(targetEmail: string): void {
    this.httpClient
      .get<EncryptedMessage[]>(`/api/history/chat?contact=${targetEmail}`)
      .pipe(
        switchMap(messages =>
          Promise.all(messages.map(message => this.decrypt(message)))
        )
      )
      .subscribe(messages =>
        messages.forEach(message => this.serverMessages$.next(message))
      );
  }

  public getHistory(targetEmail: string): Observable<RawMessage[]> {
    const messageStore: RawMessage[] = this.getSavedMessages(targetEmail);

    return of(messageStore);
  }

  public canTalk(target: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`/api/contacts/check?target=${target}`);
  }

  public getSavedMessages(targetEmail: string): RawMessage[] {
    return JSON.parse(localStorage.getItem(`${targetEmail}-message-store`));
  }

  private saveMessage(
    contactEmail: string,
    message: RawMessage,
    push: boolean = false
  ): void {
    const messageStoreSerialized = localStorage.getItem(
      `${contactEmail}-message-store`
    );
    const messageStore: RawMessage[] = JSON.parse(messageStoreSerialized) || [];

    const newMessage = {
      senderEmail: message.senderEmail || localStorage.getItem('email'),
      sentAt: message.sentAt || new Date(),
      ...message
    };
    messageStore.push(newMessage);
    localStorage.setItem(
      `${contactEmail}-message-store`,
      JSON.stringify(messageStore)
    );

    if (push) {
      this.sentMessages$.next(newMessage);
    }
  }
}
