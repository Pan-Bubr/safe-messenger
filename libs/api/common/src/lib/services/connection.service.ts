import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectionKeys,
  ConnectionList,
  ConnectionStatus,
  Invitations
} from '@safe-messenger/api-interfaces';
import { SerialisedJSON } from '@wireapp/proteus/dist/keys/PreKeyBundle';

import { Repository, UpdateResult } from 'typeorm';

import { ConnectionEntity } from '../entities/connection-entity';
import { UserEntity } from '../entities/user-entity';
import { UserService } from './user.service';

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private readonly connectionEntityRepository: Repository<ConnectionEntity>,
    private readonly userService: UserService
  ) {}

  public async createConnection(
    initiatorEmail: string,
    targetEmail: string,
    keyBundle: SerialisedJSON
  ): Promise<ConnectionEntity> {
    const [initiator, target] = await Promise.all([
      this.userService.findOne(initiatorEmail),
      this.userService.findOne(targetEmail)
    ]);

    const existingConnection = await this.findConnection(
      initiatorEmail,
      targetEmail
    );

    return (
      existingConnection ||
      this.connectionEntityRepository.save({
        initiator,
        target,
        keyBundleId: keyBundle.id,
        keyBundleKey: keyBundle.key,
        status: ConnectionStatus.PENDING
      })
    );
  }

  public async findConnection(
    initiatorEmail: string,
    targetEmail: string
  ): Promise<ConnectionEntity> {
    const [initiator, target] = await Promise.all([
      this.userService.findOne(initiatorEmail),
      this.userService.findOne(targetEmail)
    ]);

    const connectionA = await this.connectionEntityRepository.findOne({
      initiator,
      target
    });
    const connectionB = await this.connectionEntityRepository.findOne({
      initiator: target,
      target: initiator
    });

    return connectionA || connectionB;
  }

  public async canTalk(emailA: string, emailB: string): Promise<boolean> {
    const [userA, userB] = await Promise.all([
      this.userService.findOne(emailA),
      this.userService.findOne(emailB)
    ]);

    const connection = await this.connectionEntityRepository.findOne({
      where: [
        { initiator: userA, target: userB },
        { initiator: userB, target: userA }
      ]
    });

    return connection && connection.status === ConnectionStatus.ACCEPTED;
  }

  public async getConnections(email: string): Promise<ConnectionList> {
    const user = await this.userService.findOne(email);

    const [received, initiated] = await Promise.all([
      this.connectionEntityRepository.find({
        relations: ['target', 'initiator'],
        where: { target: user }
      }),
      this.connectionEntityRepository.find({
        relations: ['target', 'initiator'],
        where: { initiator: user }
      })
    ]);

    return {
      received: received
        .filter(({ status }) => status !== ConnectionStatus.PENDING)
        .map(connection => connection.initiator),
      initiated: initiated
        .filter(({ status }) => status !== ConnectionStatus.PENDING)
        .map(connection => connection.target)
    };
  }

  public async getInvitations(email: string): Promise<Invitations> {
    const user = await this.userService.findOne(email);

    const [received, initiated] = await Promise.all([
      this.connectionEntityRepository.find({
        relations: ['target', 'initiator'],
        where: { target: user, status: ConnectionStatus.PENDING }
      }),
      this.connectionEntityRepository.find({
        relations: ['target', 'initiator'],
        where: { initiator: user, status: ConnectionStatus.PENDING }
      })
    ]);

    return {
      received: received.map(connection => connection.initiator.email),
      sent: initiated.map(connection => connection.target.email)
    };
  }

  public async modifyConnection(
    initiatorEmail: string,
    targetEmail: string,
    status: ConnectionStatus,
    handshake?: string
  ): Promise<UpdateResult> {
    const [initiator, target] = await Promise.all([
      this.userService.findOne(initiatorEmail),
      this.userService.findOne(targetEmail)
    ]);

    return this.connectionEntityRepository.update(
      {
        initiator,
        target
      },
      {
        status,
        handshake
      }
    );
  }

  public async deleteConnection(
    initiatorEmail: string,
    targetEmail: string
  ): Promise<{ initiator: UserEntity; target: UserEntity } & ConnectionEntity> {
    const [initiator, target] = await Promise.all([
      this.userService.findOne(initiatorEmail),
      this.userService.findOne(targetEmail)
    ]);

    const connection = await this.connectionEntityRepository.findOne({
      initiator,
      target
    });

    return this.connectionEntityRepository.remove(connection);
  }

  public async getKeyBundle(
    emailA: string,
    emailB: string
  ): Promise<ConnectionKeys> {
    const [A, B] = await Promise.all([
      this.userService.findOne(emailA),
      this.userService.findOne(emailB)
    ]);

    const connection = await this.findConnection(emailA, emailB);

    return (
      connection && {
        handshake: connection.handshake || null,
        keyBundle: {
          key: connection.keyBundleKey,
          id: connection.keyBundleId
        }
      }
    );
  }

  public async removeConnection(connection: ConnectionEntity): Promise<ConnectionEntity> {
    return this.connectionEntityRepository.remove(connection);
  }
}
