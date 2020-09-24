import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

import { UserEntity } from './user-entity';

@Entity('message')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @ManyToOne('UserEntity', { nullable: false })
  public sender: UserEntity;

  @ManyToOne('UserEntity', { nullable: false })
  public recipient: UserEntity;

  @Column({ type: 'text' })
  public sessionId: string;

  @Column({ type: 'text' })
  public content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  public sentAt: Date;
}
