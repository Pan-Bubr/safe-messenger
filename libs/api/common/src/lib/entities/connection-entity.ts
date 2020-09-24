import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { UserEntity } from './user-entity';

@Entity('connection')
export class ConnectionEntity {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @ManyToOne('UserEntity', 'connectionsReceived', { nullable: false, onDelete: 'CASCADE' })
  public initiator: UserEntity;

  @ManyToOne('UserEntity', 'connectionsReceived', { nullable: false, onDelete: 'CASCADE' })
  public target: UserEntity;

  @Column({ nullable: false })
  public status: number;

  @Column()
  public keyBundleId: number;

  @Column()
  public keyBundleKey: string;

  @Column({ nullable: true })
  public handshake: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  public updatedAt: Date;
}
