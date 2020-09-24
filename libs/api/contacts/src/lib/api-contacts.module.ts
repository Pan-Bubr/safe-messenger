import { Module } from '@nestjs/common';
import { ApiCommonModule } from '@safe-messenger/api/common';

import { ContactsController } from './controllers/contacts.controller';

@Module({
  imports: [ApiCommonModule],
  controllers: [ContactsController],
  providers: [],
  exports: []
})
export class ApiContactsModule {}
