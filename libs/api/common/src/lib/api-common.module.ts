import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as ConnectRedis from 'connect-redis';
import * as session from 'express-session';
import { RedisModule, RedisService } from 'nestjs-redis';
import { NestSessionOptions, SessionModule } from 'nestjs-session';

import { ConnectionEntity } from './entities/connection-entity';
import { MessageEntity } from './entities/message-entity';
import { UserEntity } from './entities/user-entity';
import { ConnectionService } from './services/connection.service';
import { CryptoService } from './services/crypto.service';
import { MessageService } from './services/message.service';
import { UserService } from './services/user.service';

const RedisStore = ConnectRedis(session);

@Module({
  controllers: [],
  imports: [
    RedisModule.register({
      url: 'redis://localhost:6379'
    }),
    SessionModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService): NestSessionOptions => {
        const redisClient = redisService.getClient();
        const store = new RedisStore({ client: redisClient as any });

        return {
          session: {
            resave: true,
            saveUninitialized: false,
            store,
            secret: process.env.SESSION_SECRET
          }
        };
      }
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: Number(process.env.DB_SERVER_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, ConnectionEntity, MessageEntity],
      synchronize: true,
      logging: true
    }),
    TypeOrmModule.forFeature([UserEntity, ConnectionEntity, MessageEntity])
  ],
  providers: [CryptoService, UserService, ConnectionService, MessageService],
  exports: [CryptoService, UserService, ConnectionService, MessageService]
})
export class ApiCommonModule {}
