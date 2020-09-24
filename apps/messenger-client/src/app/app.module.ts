import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from '@safe-messenger/client/common';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { AuthService, LoggedInGuard } from '@safe-messenger/client/login';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: 'home'
        },
        {
          path: 'login',
          loadChildren: () =>
            import('@safe-messenger/client/login').then(
              m => m.ClientLoginModule
            )
        },
        {
          path: 'home',
          loadChildren: () =>
            import('@safe-messenger/client/home').then(m => m.ClientHomeModule),
          canActivate: [LoggedInGuard]
        },
        {
          path: 'profile',
          loadChildren: () =>
            import('@safe-messenger/client/profile').then(
              m => m.ClientProfileModule
            ),
          canActivate: [LoggedInGuard]
        },
        {
          path: 'chat',
          loadChildren: () =>
            import('@safe-messenger/client/chat').then(m => m.ClientChatModule),
          canActivate: [LoggedInGuard]
        },
        {
          path: 'profile',
          loadChildren: () =>
            import('@safe-messenger/client/profile').then(m => m.ClientProfileModule),
          canActivate: [LoggedInGuard]
        },
        {
          path: 'admin',
          loadChildren: () =>
            import('@safe-messenger/client/admin').then(
              m => m.ClientAdminModule
            )
        }
      ],
      { enableTracing: false }
    ),
    NoopAnimationsModule
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
