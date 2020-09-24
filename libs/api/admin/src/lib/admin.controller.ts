import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '@safe-messenger/api/auth';
import { UserEntity, UserService } from '@safe-messenger/api/common';

import { DeleteResult } from 'typeorm';

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post('add')
  @UseGuards(AdminJwtGuard)
  public async addUser(
    @Body() { email, displayName }: { email: string; displayName: string }
  ): Promise<UserEntity> {
    return this.userService.save(email, displayName);
  }

  @Post('list')
  @UseGuards(AdminJwtGuard)
  public async getUsers(@Body() { page }: { page: number }): Promise<string[]> {
    return this.userService.findEmails(page);
  }

  @Post('remove')
  @UseGuards(AdminJwtGuard)
  public async removeUser(
    @Body() { email }: { email: string }
  ): Promise<DeleteResult> {
    return this.userService.delete(email);
  }
}
