import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ConnectionKeys,
  ConnectionList,
  ConnectionStatus,
  Invitations,
  User
} from '@safe-messenger/api-interfaces';
import { CryptoService } from '@safe-messenger/client/crypto';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  constructor(
    private readonly http: HttpClient,
    private readonly cryptoService: CryptoService
  ) {}

  public contacts$: Subject<User[]> = new BehaviorSubject([]);
  public invitationsReceived$: Subject<string[]> = new BehaviorSubject([]);
  public invitationsSent$: Subject<string[]> = new BehaviorSubject([]);

  public getContacts(): Observable<void> {
    return this.http
      .get<ConnectionList>(
        `/api/contacts/list/?status=${ConnectionStatus.ACCEPTED}`
      )
      .pipe(
        map(connections => {
          this.contacts$.next([
            ...connections.initiated.map(user => ({
              ...user,
              initiator: true
            })),
            ...connections.received.map(user => ({ ...user, initiator: false }))
          ]);
        })
      );
  }

  public getInvitations(): Observable<void> {
    return this.http.get<Invitations>(`/api/contacts/invitations/`).pipe(
      map(invitations => {
        this.invitationsReceived$.next(invitations.received);
        this.invitationsSent$.next(invitations.sent);
      })
    );
  }

  public acceptInvitation(
    initiator: string,
    status: ConnectionStatus
  ): Observable<void> {
    return this.http
      .get<ConnectionKeys>(`/api/contacts/key?partner=${initiator}`)
      .pipe(
        switchMap(keys =>
          this.cryptoService.initializeSessionFromPreKey(
            initiator,
            keys.keyBundle
          )
        ),
        switchMap(handshake =>
          this.http.post<User[]>(`/api/contacts/accept`, {
            initiator,
            status,
            handshake
          })
        ),
        switchMap(() => this.getInvitations()),
        switchMap(() => this.getContacts())
      );
  }
  public rejectInvitation(
    initiator: string,
    status: ConnectionStatus
  ): Observable<void> {
    return this.http
      .post<User[]>(`/api/contacts/answer`, {
        initiator,
        status
      })
      .pipe(
        switchMap(() => this.getInvitations()),
        switchMap(() => this.getContacts())
      );
  }

  public cancelInvitation(target: string): Observable<void> {
    return this.http
      .post<User[]>(`/api/contacts/delete`, {
        target
      })
      .pipe(switchMap(() => this.getInvitations()));
  }

  public sendInvitation(target: string): Observable<void> {
    return fromPromise(this.cryptoService.preparePreKeyBundle(target)).pipe(
      switchMap(keyBundle =>
        this.http.post(`/api/contacts/invite`, { target, keyBundle })
      ),
      switchMap(() => this.getInvitations())
    );
  }

  public resetConnection(target: string): Observable<object> {
    return fromPromise(this.cryptoService.preparePreKeyBundle(target)).pipe(
      switchMap(keyBundle =>
        this.http.post(`/api/contacts/restart`, { target, keyBundle })
      )
    );
  }
}
