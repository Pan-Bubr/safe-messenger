import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private readonly adminService: AdminAuthService,
    private readonly router: Router
  ) {}
  public canActivate(): Promise<boolean> {
    return this.adminService.isLoggedIn()
      ? Promise.resolve(true)
      : this.router.navigateByUrl('/admin/login');
  }
}
