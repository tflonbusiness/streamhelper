import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import { KickChatReplyService } from './kick-chat-reply.service.js';
import { KickCommandRouter } from './kick-command.router.js';
import { KickEventsService } from './kick-events.service.js';
import { KickWebhookController } from './kick-webhook.controller.js';
import { KickWebhookVerifierService } from './kick-webhook-verifier.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [KickWebhookController],
  providers: [
    KickWebhookVerifierService,
    KickCommandRouter,
    ChatRollIntakeHandler,
    KickChatReplyService,
    KickEventsService,
  ],
  exports: [KickEventsService],
})
export class KickChatModule {}
