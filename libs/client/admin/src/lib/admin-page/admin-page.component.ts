import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminAuthService } from '../services/admin-auth.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'safe-messenger-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit, OnDestroy {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminAuthService: AdminAuthService,
    private readonly router: Router
  ) {}

  public newUser: { email: string; displayName: string } = {
    email: '',
    displayName: ''
  };

  public addForm: FormGroup = new FormGroup({
    email: new FormControl(this.newUser.email, [
      Validators.required,
      Validators.email
    ]),
    displayName: new FormControl(this.newUser.displayName, [
      Validators.required
    ])
  });

  public emails: string[] = [];
  public ngOnInit(): void {
    this.adminService.userList().subscribe(emails => {
      this.emails = emails;
    });
  }

  public refresh(): void {
    this.adminService.userList().subscribe(emails => {
      this.emails = emails;
    });
  }

  public addUser({
    email,
    displayName
  }: {
    email: string;
    displayName: string;
  }): void {
    this.adminService.addUser(email, displayName).subscribe(() => {
      this.refresh();
    });

    this.addForm.reset();
  }

  public delete(email: string): void {
    this.adminService.remove(email).subscribe(() => {
      this.refresh();
    });
  }

  public async logout(): Promise<void> {
    this.adminAuthService.logout();
    await this.router.navigateByUrl('/');
  }

  public ngOnDestroy(): void {
    this.adminAuthService.logout();
  }
}
