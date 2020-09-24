import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EncryptedMessage } from '@safe-messenger/api-interfaces';

import { Repository } from 'typeorm';

import { MessageEntity } from '../entities/message-entity';
import { UserService } from './user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageEntityRepository: Repository<MessageEntity>,
    private readonly userService: UserService
  ) {}

  public async getMessages(
    userEmail: string,
    contactEmail: string
  ): Promise<MessageEntity[]> {
    const [sender, recipient] = await Promise.all([
      this.userService.findOne(contactEmail),
      this.userService.findOne(userEmail)
    ]);

    const messages = await this.messageEntityRepository.find({
      relations: ['sender', 'recipient'],
      where: [
        {
          sender,
          recipient
        }
      ],
      order: {
        sentAt: 'DESC'
      }
    });

    const removed = await this.messageEntityRepository.remove(messages, {});

    return messages;
  }

  public async saveMessage(
    message: EncryptedMessage,
    senderMail: string
  ): Promise<Partial<MessageEntity> | MessageEntity> {
    const [recipient, sender] = await Promise.all([
      this.userService.findOne(message.recipientEmail),
      this.userService.findOne(senderMail)
    ]);

    return this.messageEntityRepository.save({
      sender,
      recipient,
      content: message.content,
      sessionId: message.sessionId
    });
  }
}
