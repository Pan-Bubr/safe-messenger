import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiTokenMessage } from '@safe-messenger/api-interfaces';

import * as moment from 'moment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  constructor(private readonly http: HttpClient) {}

  public login(login: string, password: string): Observable<ApiTokenMessage> {
    return this.http
      .post<ApiTokenMessage>('/api/auth/admin', {
        login,
        password
      })
      .pipe(tap(result => this.setSession(result)));
  }

  private setSession(authResult: ApiTokenMessage): void {
    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('admin_token', authResult.token);
    localStorage.setItem(
      'admin_expires_at',
      JSON.stringify(expiresAt.valueOf())
    );
  }

  public logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_expires_at');
  }

  public isLoggedIn(): boolean {
    const expiration = localStorage.getItem('admin_expires_at');
    const expiresAt = JSON.parse(expiration);

    return moment().isBefore(moment(expiresAt));
  }
}
