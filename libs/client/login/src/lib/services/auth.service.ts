import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiTokenMessage } from '@safe-messenger/api-interfaces';

import * as moment from 'moment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  public login(email: string, code: string): Observable<ApiTokenMessage> {
    return this.http
      .post<ApiTokenMessage>('api/auth/verify', {
        email,
        code
      })
      .pipe(
        tap(result => this.setSession(result)),
        tap(() => localStorage.setItem('email', email))
      );
  }

  private setSession(authResult: ApiTokenMessage): void {
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('id_token', authResult.token);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }

  public logout(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  }

  public isLoggedIn(): boolean {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);

    return moment().isBefore(moment(expiresAt));
  }

  public getToken(): string {
    return localStorage.getItem('id_token');
  }
}
