import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { InternalSubscriptionsController } from './internal-subscriptions.controller.js';
import { InternalSubscriptionsService } from './internal-subscriptions.service.js';
import { PlatformAdminService } from './platform-admin.service.js';

@Module({
  imports: [AuthModule],
  controllers: [InternalSubscriptionsController],
  providers: [PlatformAdminService, InternalSubscriptionsService],
  exports: [PlatformAdminService],
})
export class InternalAdminModule {}
