import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { flushGrowingJackpotWinnerChatAnnouncements } from '../growing-jackpot/growing-jackpot-winner-announce.js';
import { GrowingJackpotService } from '../growing-jackpot/growing-jackpot.service.js';
import { ChatRollIntakeHandler } from './handlers/chat-roll-intake.handler.js';
import { FirstReactionIntakeHandler } from './handlers/first-reaction-intake.handler.js';
import { GrowingJackpotIntakeHandler } from './handlers/growing-jackpot-intake.handler.js';
import { WinnerResponseHandler } from './handlers/winner-response.handler.js';
import { KickChatReplyService } from './kick-chat-reply.service.js';
import type {
  KickChatIntakeOptions,
  KickChatMessageEvent,
  KickChatRouteResult,
} from './kick-chat.types.js';

const DUPLICATE_INTAKE: KickChatIntakeOptions = { duplicateChatEvent: true };
const FRESH_INTAKE: KickChatIntakeOptions = { duplicateChatEvent: false };

@Injectable()
export class KickCommandRouter {
  constructor(
    private readonly database: DatabaseService,
    private readonly winnerResponse: WinnerResponseHandler,
    private readonly firstReactionIntake: FirstReactionIntakeHandler,
    private readonly chatRollIntake: ChatRollIntakeHandler,
    private readonly growingJackpotIntake: GrowingJackpotIntakeHandler,
    private readonly growingJackpot: GrowingJackpotService,
    private readonly chatReply: KickChatReplyService,
  ) {}

  async routeChatMessage(
    event: KickChatMessageEvent,
  ): Promise<KickChatRouteResult> {
    const winnerResponse = await this.winnerResponse.handle(event);

    const broadcasterId = String(event.broadcaster.user_id);
    const accountId = await this.database.getAccountIdByKickChannelId(
      broadcasterId,
    );

    let intakeOptions = FRESH_INTAKE;
    if (accountId !== null) {
      const hasSubscription = await this.database.accountHasSubscriptionAccess(
        accountId,
      );
      if (hasSubscription) {
        const isNew = await this.database.recordKickChatEvent({
          messageId: event.message_id,
          broadcasterId,
          senderId: String(event.sender.user_id),
          content: event.content,
        });
        if (!isNew) {
          intakeOptions = DUPLICATE_INTAKE;
        }
      }
    }

    const [firstReaction, intake, growingJackpot] = await Promise.all([
      this.firstReactionIntake.handle(event, intakeOptions),
      this.chatRollIntake.handle(event, intakeOptions),
      this.growingJackpotIntake.handle(event, intakeOptions),
    ]);

    if (accountId !== null && intakeOptions === FRESH_INTAKE) {
      await flushGrowingJackpotWinnerChatAnnouncements({
        database: this.database,
        growingJackpot: this.growingJackpot,
        chatReply: this.chatReply,
        accountId,
        broadcasterUserId: broadcasterId,
      });
    }

    return { winnerResponse, firstReaction, intake, growingJackpot };
  }
}
