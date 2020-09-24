import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@safe-messenger/client/login';

import { of, throwError } from 'rxjs';

import { LoginPageComponent } from './login-page.component';

const MockAuthService = {
  isLoggedIn: jest.fn(),
  login: jest.fn()
};

const MockRouter = {
  navigateByUrl: jest.fn()
};

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let httpTestingController: HttpTestingController;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: MockAuthService
        },
        {
          provide: Router,
          useValue: MockRouter
        }
      ],
      declarations: [LoginPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  describe('ngOnInit()', () => {
    it('should redirect to /home if user is logged', () => {
      MockAuthService.isLoggedIn.mockImplementationOnce(() => true);
      MockRouter.navigateByUrl.mockImplementationOnce(() => true);

      component.ngOnInit();

      expect(MockAuthService.isLoggedIn).toBeCalled();
      expect(MockRouter.navigateByUrl).toBeCalledWith('/home');
    });
  });

  describe('askForCode()', () => {
    it('should rend request for code', () => {
      const mockPayload = { email: 'mockEmail' };
      component.askForCode(mockPayload);

      const req = httpTestingController.expectOne(
        `api/auth/request?email=${mockPayload.email}`
      );

      req.flush({ success: true });

      expect(req.request.method).toEqual('GET');
      expect(component.emailSent).toEqual(mockPayload.email);
      expect(component.whitelistError).toBe(false);
      expect(component.unauthorizedError).toBe(false);
    });

    it('should display whitelistError when given 403 status', () => {
      const mockPayload = { email: 'mockEmail' };
      component.askForCode(mockPayload);

      const req = httpTestingController.expectOne(
        `api/auth/request?email=${mockPayload.email}`
      );

      req.error(new ErrorEvent('Invalid request parameters'), {
        status: 403,
        statusText: 'Invalid Request'
      });

      expect(req.request.method).toEqual('GET');
      expect(component.emailSent).toEqual(undefined);
      expect(component.whitelistError).toBe(true);
      expect(component.unauthorizedError).toBe(false);
    });
  });

  describe('verifyCode()', () => {
    it('should navigate to /home after', () => {
      MockAuthService.login.mockImplementationOnce(() => of({ success: true }));
      MockRouter.navigateByUrl.mockImplementationOnce(() => true);
      const mockCode = '123456';
      component.verifyCode({ code: mockCode });

      expect(component.unauthorizedError).toBe(false);
      expect(MockRouter.navigateByUrl).toBeCalledWith('/home');
    });

    it('should display unauthorizedError', () => {
      MockAuthService.login.mockImplementationOnce(() =>
        throwError(
          new HttpErrorResponse({
            error: 'Unauthorized!',
            status: 401
          })
        )
      );
      MockRouter.navigateByUrl.mockImplementationOnce(() => true);
      const mockCode = '123456';

      component.verifyCode({ code: mockCode });

      expect(component.unauthorizedError).toBe(true);
      expect(component.emailSent).toBe(null);
    });
  });
});
