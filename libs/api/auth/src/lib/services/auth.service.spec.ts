import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService, UserService } from '@safe-messenger/api/common';

import { RedisService } from 'nestjs-redis';

import { AuthService } from './auth.service';

const MockUserService = {
  findOne: jest.fn()
};

const MockMailerService = {
  sendMail: jest.fn()
};

const MockCryptoService = {
  getAuthCode: jest.fn()
};

const MockRedisService = {
  getClient: jest.fn()
};

const MockJwtService = {
  sign: jest.fn()
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: MockUserService
        },
        { provide: MailerService, useValue: MockMailerService },
        { provide: RedisService, useValue: MockRedisService },
        { provide: CryptoService, useValue: MockCryptoService },
        { provide: JwtService, useValue: MockJwtService }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('verifyWhitelist', () => {
    it('should reject mail addresses that are not in the database', async () => {
      MockUserService.findOne.mockImplementationOnce(() =>
        Promise.resolve(true)
      );
      const exampleEmail = 'user@example.com';
      const result = await service.verifyWhitelist(exampleEmail);

      expect(MockUserService.findOne).toBeCalledWith(exampleEmail);
      expect(result).toEqual(true);
    });

    it('should accept mail addresses that are in the database', async () => {
      MockUserService.findOne.mockImplementationOnce(() =>
        Promise.resolve(false)
      );

      const exampleEmail = 'user@example.com';
      const result = await service.verifyWhitelist(exampleEmail);

      expect(MockUserService.findOne).toBeCalledWith(exampleEmail);
      expect(result).toEqual(false);
    });
  });

  describe('sendAuthRequest', () => {
    const mockAuthCode = '123456';
    MockCryptoService.getAuthCode.mockImplementationOnce(() => {
      return mockAuthCode;
    });

    const mockSet = jest.fn();
    MockRedisService.getClient.mockImplementationOnce(() => ({
      set: mockSet
    }));

    const mockMail = 'user@example.com';
    MockMailerService.sendMail.mockImplementationOnce(() => Promise.resolve());

    it('should request authCode from CryptoService', async () => {
      await service.sendAuthCodeMail(mockMail);
      expect(MockCryptoService.getAuthCode).toBeCalled();
    });

    it('should add code to the redis database with 60 seconds expire date', async () => {
      expect(mockSet).toBeCalledWith(
        `Auth-${mockMail}`,
        `Code-${mockAuthCode}`,
        'EX',
        300
      );
    });

    xit('should send a mail with an authorization code to a given email', async () => {
      expect(MockMailerService.sendMail).toBeCalledWith({
        to: mockMail,
        from: 'Safe Messenger <a_golawski@poczta.wwsi.edu.pl>', // Senders email address
        subject: 'Safe messenger auth code', // Subject line
        text: `Your authorization code is ${mockAuthCode}.`, // plaintext body
        html: `Your authorization code is ${mockAuthCode}.`
      });
    });
  });

  describe('validateCode', () => {
    it('should validate the authentication code with saved redis', async () => {
      const mockMail = 'user@example.com';
      const mockAuthCode = '123456';

      const mockGet = jest.fn(() => `Code-${mockAuthCode}`);
      MockRedisService.getClient.mockImplementationOnce(() => ({
        get: mockGet
      }));

      expect(await service.validateCode(mockMail, mockAuthCode)).toBe(true);
      expect(mockGet).toBeCalledWith(`Auth-${mockMail}`);
    });

    it('should delete the authentication code from redis after a failed attempt', async () => {
      const mockMail = 'user@example.com';
      const mockAuthCode = '123456';

      const mockGet = jest.fn(() => `Different code`);
      const mockDel = jest.fn(() => 1);
      MockRedisService.getClient.mockImplementation(() => ({
        get: mockGet,
        del: mockDel
      }));

      expect(await service.validateCode(mockMail, mockAuthCode)).toBe(false);
      expect(mockGet).toBeCalledWith(`Auth-${mockMail}`);
      expect(mockDel).toBeCalledWith(`Auth-${mockMail}`);
    });
  });

  describe('login', () => {
    it('should return signed JWT token', () => {
      const mockData = {
        email: 'mockMail'
      };

      const mockToken = 'mockToken';

      MockJwtService.sign.mockImplementationOnce(() => mockToken);
      expect(service.login(mockData.email)).toEqual(mockToken);
      expect(MockJwtService.sign).toBeCalledWith(mockData);
    });
  });

  describe('loginAdmin', () => {
    it('should return signed JWT token', () => {
      const mockToken = 'mockToken';

      MockJwtService.sign.mockImplementationOnce(() => mockToken);
      expect(service.loginAdmin()).toEqual(mockToken);
      expect(MockJwtService.sign).toBeCalledWith({ admin: true });
    });
  });
});
