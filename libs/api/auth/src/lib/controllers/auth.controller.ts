import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiStatus, ApiTokenMessage } from '@safe-messenger/api-interfaces';

import { AdminGuard } from '../guards/admin.guard';
import { CodeLoginGuard } from '../guards/code-login-guard';
import { WhitelistGuard } from '../guards/whitelist.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('request')
  @UseGuards(WhitelistGuard)
  public async getUser(
    @Query() { email }: { email: string }
  ): Promise<ApiStatus> {
    const success = await this.authService.sendAuthCodeMail(email);

    return {
      success
    };
  }

  @Post('verify')
  @UseGuards(CodeLoginGuard)
  public getCode(@Body() { email }: { email: string }): ApiTokenMessage {
    return {
      success: true,
      token: this.authService.login(email),
      expiresIn: 30000
    };
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  public loginAdmin(): ApiTokenMessage {
    return {
      success: true,
      token: this.authService.loginAdmin(),
      expiresIn: 30000
    };
  }
}
