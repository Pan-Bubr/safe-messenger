import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';

import { UserEntity } from '../entities/user-entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  public findOne(email: string): Promise<UserEntity> {
    return this.usersRepository.findOne({ email });
  }

  public findEmails(page: number): Promise<string[]> {
    const PAGE_COUNT = 50;

    return this.usersRepository
      .find({
        select: ['email'],
        take: PAGE_COUNT,
        skip: page * PAGE_COUNT
      })
      .then(users => users.map(user => user.email));
  }

  public async save(email: string, displayName: string): Promise<UserEntity> {
    return this.usersRepository.save({
      email,
      displayName
    });
  }

  public async delete(email: string): Promise<DeleteResult> {
    return await this.usersRepository.delete({ email });
  }
}
