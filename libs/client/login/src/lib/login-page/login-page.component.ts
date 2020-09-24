import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiStatus } from '@safe-messenger/api-interfaces';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'safe-messenger-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  public loginForm: FormGroup = new FormGroup({
    email: new FormControl()
  });

  public codeForm: FormGroup = new FormGroup({
    code: new FormControl()
  });

  public emailSent: string;
  public whitelistError: boolean;
  public unauthorizedError: boolean;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/home');
    }
  }

  public askForCode({ email }: { email: string }): void {
    this.whitelistError = false;
    this.unauthorizedError = false;
    this.httpClient
      .get<ApiStatus>('api/auth/request', {
        params: {
          email
        }
      })
      .subscribe(
        () => {
          this.emailSent = email;
          this.loginForm = new FormGroup({
            email: new FormControl({
              value: this.emailSent,
              disabled: this.emailSent
            })
          });
        },
        (err: HttpErrorResponse) => {
          this.whitelistError = err.status === 403;
        }
      );
  }

  public verifyCode({ code }: { code: string }): void {
    this.unauthorizedError = false;
    this.authService.login(this.emailSent, code).subscribe(
      () => {
        return this.router.navigateByUrl('/home');
      },
      (err: HttpErrorResponse) => {
        this.unauthorizedError = err.status === 401;
        this.emailSent = null;
        this.loginForm = new FormGroup({
          email: new FormControl()
        });
      }
    );
  }
}
