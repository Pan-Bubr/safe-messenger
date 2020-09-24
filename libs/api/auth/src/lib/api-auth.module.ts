import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiCommonModule } from '@safe-messenger/api/common';

import { AuthController } from './controllers/auth.controller';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { AdminJwtStrategy } from './guards/admin-jwt.strategy';
import { AdminGuard } from './guards/admin.guard';
import { AdminStrategy } from './guards/admin.strategy';
import { CodeLoginGuard } from './guards/code-login-guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtWsStrategy } from './guards/jwtws.strategy';
import { LocalStrategy } from './guards/local.strategy';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '30000s'
      }
    }),
    PassportModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOSTNAME,
        port: 465,
        tls: {
          ciphers: 'SSLv3',
          secureProtocol: 'TLSv1_method'
        },
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_ID, // generated ethereal user
          pass: process.env.EMAIL_PASS // generated ethereal password
        }
      },
      defaults: {
        from: '"nest-modules" <user@outlook.com>' // outgoing email ID
      },
      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true
        }
      }
    }),
    ApiCommonModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CodeLoginGuard,
    AdminGuard,
    LocalStrategy,
    JwtStrategy,
    JwtWsStrategy,
    AdminStrategy,
    AdminJwtStrategy,
    AdminJwtGuard
  ],
  exports: []
})
export class ApiAuthModule {}
