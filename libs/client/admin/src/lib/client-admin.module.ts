import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminAuthService } from './services/admin-auth.service';

const adminRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'panel'
  },
  {
    path: 'panel',
    component: AdminPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'login',
    component: AdminLoginComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
    ReactiveFormsModule
  ],
  declarations: [AdminPageComponent, AdminLoginComponent],
  providers: [AdminAuthService]
})
export class ClientAdminModule {}
