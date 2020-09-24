import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import * as moment from 'moment';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('login()', () => {
    it('should request verification endpoint with given credentials', () => {
      const mockEmail = 'mockEmail';
      const mockCode = 'mockCode';
      const mockToken = 'mockToken';
      const mockStatus = {
        success: true,
        token: mockToken,
        expireIn: 300
      };

      service
        .login(mockEmail, mockCode)
        .subscribe(message => expect(message).toEqual(mockStatus));

      const req = httpTestingController.expectOne('api/auth/verify');
      expect(req.request.method).toEqual('POST');

      req.flush(mockStatus);
    });

    it('should store token in the localStorage', () => {
      const mockEmail = 'mockEmail';
      const mockCode = 'mockCode';
      const mockToken = 'mockToken';
      const mockStatus = {
        success: true,
        token: mockToken,
        expireIn: 300
      };

      service.login(mockEmail, mockCode).subscribe(() => {
        expect(localStorage.getItem('id_token')).toEqual(mockToken);
      });

      const req = httpTestingController.expectOne('api/auth/verify');
      expect(req.request.method).toEqual('POST');

      req.flush(mockStatus);
    });
  });

  describe('logout()', () => {
    it('should delete token from localStorage', () => {
      const mockToken = 'mockToken';
      const expiresAt = JSON.stringify(Date.now());

      localStorage.setItem('id_token', mockToken);
      localStorage.setItem('expires_at', expiresAt);

      service.logout();

      expect(localStorage.getItem('id_token')).toBe(null);
      expect(localStorage.getItem('expires_at')).toBe(null);
    });
  });

  describe('isLoggedIn()', () => {
    it('should return false when localStorage token is missing', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when localStorage token is not expired', () => {
      localStorage.setItem(
        'expires_at',
        JSON.stringify(
          moment()
            .add(300, 'second')
            .valueOf()
        )
      );
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when localStorage token is expired', () => {
      localStorage.setItem(
        'expires_at',
        JSON.stringify(
          moment()
            .subtract(300, 'second')
            .valueOf()
        )
      );

      expect(service.isLoggedIn()).toBe(false);
    });
  });
});
