import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}
  public canActivate(): Promise<boolean> {
    return this.authService.isLoggedIn()
      ? Promise.resolve(true)
      : this.router.navigateByUrl('/login');
  }
}
