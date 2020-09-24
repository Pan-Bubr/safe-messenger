import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import {
  ConnectionKeys,
  ConnectionList,
  ConnectionStatus,
  Invitations
} from '@safe-messenger/api-interfaces';
import { JwtGuard } from '@safe-messenger/api/auth';
import {
  ConnectionEntity,
  ConnectionService,
  UserEntity
} from '@safe-messenger/api/common';
import { SerialisedJSON } from '@wireapp/proteus/dist/keys/PreKeyBundle';

import { UpdateResult } from 'typeorm';

@Controller('contacts')
@UseGuards(JwtGuard)
export class ContactsController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Get('list')
  public async getContacts(
    @Request() req: { user: { email: string } }
  ): Promise<ConnectionList> {
    return this.connectionService.getConnections(req.user.email);
  }

  @Get('invitations')
  public async getInvitations(
    @Request() req: { user: { email: string } }
  ): Promise<Invitations> {
    return this.connectionService.getInvitations(req.user.email);
  }

  @Get('check')
  public async checkContact(
    @Request() { user }: { user: { email: string } },
    @Query() { target }: { target: string }
  ): Promise<boolean> {
    return this.connectionService.canTalk(user.email, target).catch(() => {
      throw new NotFoundException(`User ${target} not found!`);
    });
  }

  @Get('key')
  public async getKeyBundle(
    @Request() { user }: { user: { email: string } },
    @Query() { partner }: { partner: string }
  ): Promise<ConnectionKeys> {
    return this.connectionService
      .getKeyBundle(partner, user.email)
      .catch(() => {
        throw new NotFoundException(`User ${partner} not found!`);
      });
  }

  @Post('invite')
  public async requestInvite(
    @Request() { user }: { user: { email: string } },
    @Body() { target, keyBundle }: { target: string; keyBundle: SerialisedJSON }
  ): Promise<ConnectionEntity | NotFoundException> {
    return this.connectionService
      .createConnection(user.email, target, keyBundle)
      .catch(() => {
        throw new NotFoundException(`User ${target} not found!`);
      });
  }

  @Post('reject')
  public async rejectInvitation(
    @Request() { user }: { user: { email: string } },
    @Body()
    {
      initiator,
      status
    }: {
      initiator: string;
      status: ConnectionStatus;
    }
  ): Promise<UpdateResult | boolean> {
    if (
      status === ConnectionStatus.BLOCKED ||
      status === ConnectionStatus.REJECTED
    ) {
      return this.connectionService.modifyConnection(
        initiator,
        user.email,
        status
      );
    }

    return false;
  }

  @Post('accept')
  public async acceptInvitation(
    @Request() { user }: { user: { email: string } },
    @Body()
    {
      initiator,
      handshake
    }: {
      initiator: string;
      handshake: string;
    }
  ): Promise<UpdateResult | boolean> {
    return this.connectionService.modifyConnection(
      initiator,
      user.email,
      ConnectionStatus.ACCEPTED,
      handshake
    );
  }

  @Post('delete')
  public async cancelInvitation(
    @Request() { user }: { user: { email: string } },
    @Body()
    {
      target
    }: {
      target: string;
    }
  ): Promise<{ initiator: UserEntity; target: UserEntity } & ConnectionEntity> {
    return this.connectionService.deleteConnection(user.email, target);
  }

  @Post('restart')
  public async restartConnection(
    @Request() { user }: { user: { email: string } },
    @Body() { target, keyBundle }: { target: string; keyBundle: SerialisedJSON }
  ): Promise<ConnectionEntity> {
    const connection = await this.connectionService.findConnection(
      user.email,
      target
    );

    await this.connectionService.removeConnection(connection);

    return this.connectionService.createConnection(
      user.email,
      target,
      keyBundle
    );
  }
}
