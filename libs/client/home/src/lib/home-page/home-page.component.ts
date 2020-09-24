import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionStatus, User } from '@safe-messenger/api-interfaces';
import { ContactsService } from '@safe-messenger/client/common';
import { AuthService } from '@safe-messenger/client/login';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'safe-messenger-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public invitationError: string = null;
  constructor(
    private readonly authService: AuthService,
    private readonly contactsService: ContactsService,
    private readonly router: Router
  ) {}

  public contacts$: Observable<User[]> = this.contactsService.contacts$;
  public invitationsReceived$: Observable<string[]> = this.contactsService
    .invitationsReceived$;
  public invitationsSent$: Observable<string[]> = this.contactsService
    .invitationsSent$;

  public invitationForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  public ngOnInit(): void {
    this.contactsService.getContacts().subscribe();
    this.contactsService.getInvitations().subscribe();
  }

  public openChat(user: User): void {
    this.router.navigate(['chat', user.email]);
  }

  public accept(email: string): void {
    this.contactsService
      .acceptInvitation(email, ConnectionStatus.ACCEPTED)
      .subscribe();
  }

  public reject(email: string): void {
    this.contactsService
      .rejectInvitation(email, ConnectionStatus.REJECTED)
      .subscribe();
  }

  public block(email: string): void {
    this.contactsService
      .rejectInvitation(email, ConnectionStatus.BLOCKED)
      .subscribe();
  }

  public cancel(sent: string): void {
    this.contactsService.cancelInvitation(sent).subscribe();
  }

  public sendInvitation({ email }: { email: string }): void {
    this.invitationForm.reset();
    if (email.trim()) {
      this.contactsService
        .sendInvitation(email)
        .pipe(
          catchError(({ error }: any) => {
            this.invitationError = error.message;

            return error;
          })
        )
        .subscribe(() => {
          this.invitationError = null;
        });
    }
  }

  public openProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
