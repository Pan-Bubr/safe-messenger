import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'safe-messenger-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router
  ) {}

  public loginForm: FormGroup = new FormGroup({
    login: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  public unauthorizedError: boolean;

  public login({ login, password }: { login: string; password: string }): void {
    this.adminAuthService.login(login, password).subscribe(
      () => {
        return this.router.navigate(['admin', 'panel']);
      },
      (err: HttpErrorResponse) => {
        this.unauthorizedError = err.status === 401;
        this.loginForm = new FormGroup({
          login: new FormControl(),
          password: new FormControl()
        });
      }
    );
  }
}
