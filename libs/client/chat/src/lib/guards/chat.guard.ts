import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChatService } from '../services/chat.service';

@Injectable({
  providedIn: 'root'
})
export class ChatGuard implements CanActivate {
  constructor(
    private readonly chatService: ChatService,
    private readonly router: Router
  ) {}

  public canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
    const target = next.params.email;

    return this.chatService.canTalk(target).pipe(
      map(canTalk => {
        if (canTalk) {
          return true;
        }

        this.router.navigateByUrl('home');
      })
    );
  }
}
