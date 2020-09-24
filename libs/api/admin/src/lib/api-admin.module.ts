import { Module } from '@nestjs/common';
import { ApiAuthModule } from '@safe-messenger/api/auth';
import { ApiCommonModule } from '@safe-messenger/api/common';

import { AdminController } from './admin.controller';

@Module({
  imports: [ApiCommonModule, ApiAuthModule],
  controllers: [AdminController]
})
export class ApiAdminModule {}
