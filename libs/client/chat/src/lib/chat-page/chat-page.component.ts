import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessage, RawMessage } from '@safe-messenger/api-interfaces';
import { ContactsService } from '@safe-messenger/client/common';

import { Observable } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

import { ChatService } from '../services/chat.service';

@Component({
  selector: 'safe-messenger-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly chatService: ChatService,
    private readonly contactsService: ContactsService
  ) {}

  public historyMessages$: Observable<RawMessage[]> = this.route.params.pipe(
    pluck('email'),
    switchMap(email => this.chatService.getHistory(email))
  );

  public newMessage$: Observable<RawMessage | ErrorMessage> = this.chatService
    .newMessage$;

  public recipient$: Observable<string> = this.route.params.pipe(
    pluck('email')
  );
  public page: number = 0;
  public chatForm: FormGroup = new FormGroup({
    message: new FormControl('')
  });

  public newMessages: (RawMessage | ErrorMessage)[] = [];
  private sessionId: string;

  public async ngOnInit(): Promise<void> {
    this.sessionId = this.route.snapshot.data['sessionId'];
    this.recipient$.subscribe(async email => {
      await this.chatService.join(email);
      this.chatService.getServerMessages(email);
    });
    this.newMessage$.subscribe(message => {
      this.newMessages = [...this.newMessages, message];
    });
  }

  public async ngOnDestroy(): Promise<void> {
    await this.chatService.leave();
  }

  public sendMessage({ message }: { message: string }): void {
    this.chatForm.reset();
    if (message.trim()) {
      this.recipient$.subscribe(async recipientEmail => {
        await this.chatService.sendMessage(
          {
            senderEmail: localStorage.getItem('email'),
            recipientEmail,
            sessionId: this.sessionId,
            content: message.trim()
          },
          this.sessionId
        );
      });
    }
  }

  public returnToHomepage(): Promise<boolean> {
    return this.router.navigate(['home']);
  }

  public resetConnection(): void {
    this.recipient$.subscribe(async recipientEmail => {
      this.contactsService.resetConnection(recipientEmail).subscribe(() => {
        this.router.navigateByUrl('/');
      });
    });
  }
}
