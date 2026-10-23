import { Injectable, Logger } from '@nestjs/common';
import { canJoinChatRollWithRoles } from '../../chat-roll/chat-roll-utils.js';
import { GrowingJackpotService } from '../../growing-jackpot/growing-jackpot.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { describeIntakePersistence } from '../kick-chat-audit.js';
import { resolveKickChatRollRoleIds } from '../kick-badge.mapper.js';
import type {
  GrowingJackpotIntakeResult,
  KickChatIntakeOptions,
  KickChatMessageEvent,
} from '../kick-chat.types.js';

@Injectable()
export class GrowingJackpotIntakeHandler {
  private readonly logger = new Logger(GrowingJackpotIntakeHandler.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly growingJackpot: GrowingJackpotService,
  ) {}

  async handle(
    event: KickChatMessageEvent,
    options: KickChatIntakeOptions,
  ): Promise<GrowingJackpotIntakeResult> {
    if (options.duplicateChatEvent) {
      return { action: 'ignored', reason: 'duplicate_event' };
    }

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

    const context = await this.growingJackpot.getIntakeContext(accountId);
    if (!context) {
      return { action: 'ignored', reason: 'no_accepting_round' };
    }

    const message = event.content.trim();
    if (!this.growingJackpot.matchesKeyword(message, context.joinKeyword)) {
      return { action: 'ignored', reason: 'keyword_mismatch' };
    }

    const roleIds = resolveKickChatRollRoleIds(event.sender.identity?.badges);
    if (!canJoinChatRollWithRoles(roleIds, context.settings.roleSettings)) {
      return { action: 'ignored', reason: 'role_not_allowed' };
    }

    const providerUserId = String(event.sender.user_id);
    const displayName = event.sender.username.trim();

    const join = await this.growingJackpot.tryJoinFromChat({
      accountId,
      growingJackpotId: context.growingJackpotId,
      roundId: context.roundId,
      provider: 'kick',
      providerUserId,
      displayName,
      roleIds,
    });

    if (join.status === 'not_accepting') {
      return { action: 'entries_paused' };
    }
    if (join.status === 'duplicate') {
      return { action: 'duplicate' };
    }

    const result = {
      action: 'participant_added' as const,
      displayName,
      participantCount: join.participantCount,
    };
    this.logger.log(
      `${describeGrowingJackpotPersistence(result, {
        messageId,
        roundId: context.roundId,
      })} accountId=${accountId}`,
    );
    return result;
  }
}

function describeGrowingJackpotPersistence(
  result: GrowingJackpotIntakeResult,
  context: { messageId: string; roundId?: number },
): string {
  if (result.action === 'participant_added') {
    return `saved growing jackpot participant messageId=${context.messageId} roundId=${context.roundId ?? '?'}`;
  }
  if (result.action === 'duplicate') {
    return `not saved growing jackpot participant (duplicate user) messageId=${context.messageId} roundId=${context.roundId ?? '?'}`;
  }
  if (result.action === 'entries_paused') {
    return `not saved growing jackpot participant (round closed) messageId=${context.messageId}`;
  }
  return describeIntakePersistence(
    { action: 'ignored', reason: result.reason },
    { messageId: context.messageId },
  );
}
