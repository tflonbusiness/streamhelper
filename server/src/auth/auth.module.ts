import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JoinController } from './join.controller.js';
import { KickChannelRewardsService } from './kick-channel-rewards.service.js';
import { KickChannelService } from './kick-channel.service.js';
import { KickChatModule } from '../kick-chat/kick-chat.module.js';
import { KickOAuthService } from './kick-oauth.service.js';
import { ModuleFavoritesService } from '../module-favorites/module-favorites.service.js';

@Module({
  imports: [KickChatModule],
  controllers: [AuthController, JoinController],
  providers: [
    AuthService,
    KickOAuthService,
    KickChannelService,
    KickChannelRewardsService,
    ModuleFavoritesService,
  ],
  exports: [AuthService, KickChannelRewardsService],
})
export class AuthModule {}
