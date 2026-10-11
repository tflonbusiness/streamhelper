import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MediaInteractiveModule } from '../media-interactive/media-interactive.module.js';
import { AccountsController } from './accounts.controller.js';

@Module({
  imports: [AuthModule, MediaInteractiveModule],
  controllers: [AccountsController],
})
export class AccountsModule {}
