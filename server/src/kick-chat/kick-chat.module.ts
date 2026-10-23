import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { FirstReactionModule } from '../first-reaction/first-reaction.module.js';
import { GrowingJackpotModule } from '../growing-jackpot/growing-jackpot.module.js';
import { MediaInteractiveModule } from '../media-interactive/media-interactive.module.js';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import { FirstReactionIntakeHandler } from './handlers/first-reaction-intake.handler.js';
import { GrowingJackpotIntakeHandler } from './handlers/growing-jackpot-intake.handler.js';
import { WinnerResponseHandler } from './handlers/winner-response.handler.js';
import { KickChatReplyService } from './kick-chat-reply.service.js';
import { KickCommandRouter } from './kick-command.router.js';
import { KickEventsService } from './kick-events.service.js';
import { KickWebhookController } from './kick-webhook.controller.js';
import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';

@Module({
  imports: [
    DatabaseModule,
    MediaInteractiveModule,
    FirstReactionModule,
    forwardRef(() => GrowingJackpotModule),
  ],
  controllers: [KickWebhookController],
  providers: [
    KickWebhookVerifierService,
    KickCommandRouter,
    ChatRollIntakeHandler,
    FirstReactionIntakeHandler,
    GrowingJackpotIntakeHandler,
    WinnerResponseHandler,
    KickChatReplyService,
    KickEventsService,
  ],
  exports: [KickEventsService, KickChatReplyService],
})
export class KickChatModule {}
