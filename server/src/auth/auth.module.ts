import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JoinController } from './join.controller.js';
import { KickChannelService } from './kick-channel.service.js';
import { KickChatModule } from '../kick-chat/kick-chat.module.js';
import { KickOAuthService } from './kick-oauth.service.js';

@Module({
  imports: [KickChatModule],
  controllers: [AuthController, JoinController],
  providers: [AuthService, KickOAuthService, KickChannelService],
  exports: [AuthService],
})
export class AuthModule {}
