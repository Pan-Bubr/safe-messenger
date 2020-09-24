import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { ConnectionEntity } from './connection-entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column('varchar', { length: 500, unique: true, nullable: false })
  public email: string;

  @Column('varchar', { length: 500 })
  public displayName: string;

  @OneToMany('ConnectionEntity', 'initiator', { onDelete: 'CASCADE' })
  public connectionsRequested: [];

  @OneToMany('ConnectionEntity', 'target', { onDelete: 'CASCADE' })
  public connectionsReceived: [];

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
