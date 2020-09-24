import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';

import { ProfilePageComponent } from './profile-page/profile-page.component';

export const clientProfileRoutes: Route[] = [
  {
    path: '',
    component: ProfilePageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(clientProfileRoutes),
    FormsModule,
    ClipboardModule,
    ReactiveFormsModule
  ],
  declarations: [ProfilePageComponent]
})
export class ClientProfileModule {}
