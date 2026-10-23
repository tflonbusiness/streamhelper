import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FirstReactionModule } from '../first-reaction/first-reaction.module.js';
import { GrowingJackpotModule } from '../growing-jackpot/growing-jackpot.module.js';
import { MediaInteractiveModule } from '../media-interactive/media-interactive.module.js';
import { AccountsController } from './accounts.controller.js';

@Module({
  imports: [
    AuthModule,
    FirstReactionModule,
    GrowingJackpotModule,
    MediaInteractiveModule,
  ],
  controllers: [AccountsController],
})
export class AccountsModule {}
