import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@safe-messenger/api-interfaces';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private readonly http: HttpClient) {}
  public token: string = localStorage.getItem('admin_token');

  public addUser(email: string, displayName: string): Observable<User> {
    return this.http.post<User>('/api/admin/add', {
      token: this.token,
      email,
      displayName
    });
  }

  public userList(): Observable<string[]> {
    return this.http.post<string[]>('/api/admin/list', {
      token: this.token
    });
  }

  public remove(email: string): Observable<User> {
    return this.http.post<User>('/api/admin/remove', {
      token: this.token,
      email
    });
  }
}
