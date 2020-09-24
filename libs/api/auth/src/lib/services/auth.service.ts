import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminSignature, JwtSignature } from '@safe-messenger/api-interfaces';
import { CryptoService, UserService } from '@safe-messenger/api/common';

import { RedisService } from 'nestjs-redis';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService
  ) {}

  public async verifyWhitelist(email: string): Promise<boolean> {
    return this.userService.findOne(email).then(user => {
      return !!user;
    });
  }

  public async sendAuthCodeMail(email: string): Promise<boolean> {
    const authCode = this.cryptoService.getAuthCode();

    await this.redis
      .getClient()
      .set(`Auth-${email}`, `Code-${authCode}`, 'EX', 5 * 60);

    await this.mailerService.sendMail({
      to: email,
      from: 'Safe Messenger <a_golawski@poczta.wwsi.edu.pl>', // Senders email address
      subject: 'Safe messenger auth code', // Subject line
      text: `Your authorization code is ${authCode}.`, // plaintext body
      html: `Your authorization code is ${authCode}.`
    });

    // console.log(`AuthCode ${authCode} email sent to ${email}`);

    return true;
  }

  public async validateCode(email: string, code: string): Promise<boolean> {
    const authCode = await this.redis.getClient().get(`Auth-${email}`);

    if (authCode === `Code-${code}`) {
      return true;
    } else {
      await this.redis.getClient().del(`Auth-${email}`);

      return false;
    }
  }

  public login(email: string): string {
    const payload: JwtSignature = {
      email
    };

    return this.jwtService.sign(payload);
  }

  public loginAdmin(): string {
    const payload: AdminSignature = {
      admin: true
    };

    return this.jwtService.sign(payload);
  }
}
