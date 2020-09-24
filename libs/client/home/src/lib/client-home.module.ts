import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AuthInterceptor,
  ClientCommonModule
} from '@safe-messenger/client/common';
import { ClientCryptoModule } from '@safe-messenger/client/crypto';

import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    ClientCommonModule,
    ClientCryptoModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePageComponent
      }
    ]),
    ReactiveFormsModule
  ],
  declarations: [HomePageComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class ClientHomeModule {}
