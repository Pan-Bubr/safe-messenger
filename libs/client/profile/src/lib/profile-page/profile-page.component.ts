import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'safe-messenger-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  constructor(private readonly router: Router) {}

  public backup: string = '';
  public importedBackup: string = '';

  public importError: boolean = false;
  public copied: boolean = false;
  public importForm: FormGroup = new FormGroup({
    importText: new FormControl('', Validators.required)
  });

  public ngOnInit(): void {
    const storageCopy = { ...localStorage };

    delete storageCopy.email;
    delete storageCopy.id_token;
    delete storageCopy.expires_at;

    this.backup = JSON.stringify(storageCopy);
  }

  public returnToHomePage(): void {
    this.router.navigateByUrl('/');
  }

  public saveBackup({ importText }: { importText: string }): void {
    const fallback = { ...localStorage };
    try {
      const data = JSON.parse(importText);
      Object.keys(data).forEach((key: string) => {
        localStorage.setItem(key, data[key]);
      });

      const storageCopy = { ...localStorage };

      delete storageCopy.email;
      delete storageCopy.id_token;
      delete storageCopy.expires_at;

      this.backup = JSON.stringify(storageCopy);
      this.importError = false;
    } catch (e) {
      localStorage.clear();
      Object.keys(fallback).forEach((key: string) => {
        localStorage.setItem(key, fallback[key]);
      });
      this.importError = true;
    }

    this.importForm.reset();
  }
}
