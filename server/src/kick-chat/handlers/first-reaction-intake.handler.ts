import { Injectable, Logger } from '@nestjs/common';
import { canJoinChatRollWithRoles } from '../../chat-roll/chat-roll-utils.js';
import { commandMatchesKeyword } from '../../first-reaction/first-reaction-settings.js';
import { FirstReactionService } from '../../first-reaction/first-reaction.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { describeIntakePersistence } from '../kick-chat-audit.js';
import { resolveKickChatRollRoleIds } from '../kick-badge.mapper.js';
import { KickChatReplyService } from '../kick-chat-reply.service.js';
import type { KickChatMessageEvent } from '../kick-chat.types.js';

export type FirstReactionIntakeResult =
  | { action: 'ignored'; reason: string }
  | { action: 'won'; displayName: string; proofToken: string | null };

@Injectable()
export class FirstReactionIntakeHandler {
  private readonly logger = new Logger(FirstReactionIntakeHandler.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly firstReaction: FirstReactionService,
    private readonly chatReply: KickChatReplyService,
  ) {}

  async handle(event: KickChatMessageEvent): Promise<FirstReactionIntakeResult> {
    const messageId = event.message_id;
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

    const context = await this.firstReaction.getIntakeContext(accountId);
    if (!context) {
      return { action: 'ignored', reason: 'no_accepting_draw' };
    }

    if (
      context.preAcceptOpensAt !== null &&
      Date.now() < context.preAcceptOpensAt
    ) {
      return { action: 'ignored', reason: 'pre_accept_delay' };
    }

    const message = event.content.trim();
    if (!commandMatchesKeyword(message, context.keyword)) {
      return { action: 'ignored', reason: 'keyword_mismatch' };
    }

    const isNew = await this.database.recordKickChatEvent({
      messageId: event.message_id,
      broadcasterId,
      senderId: String(event.sender.user_id),
      content: event.content,
    });
    if (!isNew) {
      return { action: 'ignored', reason: 'duplicate_event' };
    }

    const roleIds = resolveKickChatRollRoleIds(event.sender.identity?.badges);
    if (!canJoinChatRollWithRoles(roleIds, context.settings.roleSettings)) {
      return { action: 'ignored', reason: 'role_not_allowed' };
    }

    const providerUserId = String(event.sender.user_id);
    const displayName = event.sender.username.trim();

    const claim = await this.firstReaction.tryClaimWinner({
      accountId,
      firstReactionId: context.firstReactionId,
      drawId: context.drawId,
      provider: 'kick',
      providerUserId,
      displayName,
      messageId,
      settings: context.settings,
    });

    if (!claim.claimed || !claim.draw) {
      return { action: 'ignored', reason: 'already_won' };
    }

    if (context.settings.announceWinnerInChat) {
      await this.chatReply.sendFirstReactionWinner({
        broadcasterUserId: broadcasterId,
        displayName,
        proofToken: claim.draw.proofToken ?? '',
      });
    }

    this.logger.log(
      `${describeIntakePersistence(
        { action: 'ignored', reason: 'first_reaction_won' },
        { messageId, chatRollId: context.drawId },
      )} accountId=${accountId} winner=${displayName}`,
    );

    return {
      action: 'won',
      displayName,
      proofToken: claim.draw.proofToken,
    };
  }
}
