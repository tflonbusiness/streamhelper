import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { FirstReactionModule } from '../first-reaction/first-reaction.module.js';
import { MediaInteractiveModule } from '../media-interactive/media-interactive.module.js';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import { FirstReactionIntakeHandler } from './handlers/first-reaction-intake.handler.js';
import { WinnerResponseHandler } from './handlers/winner-response.handler.js';
import { KickChatReplyService } from './kick-chat-reply.service.js';
import { KickCommandRouter } from './kick-command.router.js';
import { KickEventsService } from './kick-events.service.js';
import { KickWebhookController } from './kick-webhook.controller.js';
import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';

@Module({
  imports: [DatabaseModule, MediaInteractiveModule, FirstReactionModule],
  controllers: [KickWebhookController],
  providers: [
    KickWebhookVerifierService,
    KickCommandRouter,
    ChatRollIntakeHandler,
    FirstReactionIntakeHandler,
    WinnerResponseHandler,
    KickChatReplyService,
    KickEventsService,
  ],
  exports: [KickEventsService],
})
export class KickChatModule {}
