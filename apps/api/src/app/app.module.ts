import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { ApiAdminModule } from '@safe-messenger/api/admin';
import { ApiAuthModule } from '@safe-messenger/api/auth';
import { ApiChatModule } from '@safe-messenger/api/chat';
import { ApiCommonModule } from '@safe-messenger/api/common';
import { ApiContactsModule } from '@safe-messenger/api/contacts';

console.log(process.env.SERVER_PORT);

@Module({
  imports: [
    ApiAuthModule,
    ApiCommonModule,
    ApiContactsModule,
    ApiChatModule,
    ApiAdminModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
