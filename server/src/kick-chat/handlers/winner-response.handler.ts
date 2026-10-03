import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type {
  KickChatMessageEvent,
  WinnerResponseResult,
} from '../kick-chat.types.js';

@Injectable()
export class WinnerResponseHandler {
  private readonly logger = new Logger(WinnerResponseHandler.name);

  constructor(private readonly database: DatabaseService) {}

  async handle(event: KickChatMessageEvent): Promise<WinnerResponseResult> {
    if (!event.content.trim()) {
      return { action: 'ignored', reason: 'empty_message' };
    }

    const broadcasterId = String(event.broadcaster.user_id);
    const accountId = await this.database.getAccountIdByKickChannelId(
      broadcasterId,
    );
    if (!accountId) {
      return { action: 'ignored', reason: 'unknown_channel' };
    }

    const hasSubscription = await this.database.accountHasSubscriptionAccess(
      accountId,
    );
    if (!hasSubscription) {
      return { action: 'ignored', reason: 'subscription_expired' };
    }

    const session = await this.database.getLiveChatRollByAccountId(accountId);
    if (!session) {
      return { action: 'ignored', reason: 'no_active_session' };
    }
    if (!session.winnerResponseEnabled) {
      return { action: 'ignored', reason: 'response_disabled' };
    }

    await this.database.expirePendingChatRollWinResponses(session.id);

    const providerUserId = String(event.sender.user_id);
    const confirmed = await this.database.confirmChatRollWinResponse({
      chatRollId: session.id,
      providerUserId,
      responseMessage: event.content.trim(),
    });

    if (!confirmed) {
      return { action: 'ignored', reason: 'no_pending_win' };
    }

    const result = { action: 'confirmed' as const, winId: confirmed };
    this.logger.log(
      `saved winner response winId=${confirmed} messageId=${event.message_id} accountId=${accountId} chatRollId=${session.id} providerUserId=${providerUserId}`,
    );
    return result;
  }
}
