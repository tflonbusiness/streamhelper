import { Injectable, Logger } from '@nestjs/common';
import { canJoinChatRollWithRoles } from '../../chat-roll/chat-roll-utils.js';
import { DatabaseService } from '../../database/database.service.js';
import { resolveKickChatRollRoleIds } from '../kick-badge.mapper.js';
import { KickChatReplyService } from '../kick-chat-reply.service.js';
import type {
  ChatRollIntakeResult,
  KickChatMessageEvent,
} from '../kick-chat.types.js';

@Injectable()
export class ChatRollIntakeHandler {
  private readonly logger = new Logger(ChatRollIntakeHandler.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly chatReply: KickChatReplyService,
  ) {}

  async handle(event: KickChatMessageEvent): Promise<ChatRollIntakeResult> {
    const broadcasterId = String(event.broadcaster.user_id);
    const accountId = await this.database.getAccountIdByKickChannelId(
      broadcasterId,
    );
    if (!accountId) {
      const result = { action: 'ignored' as const, reason: 'unknown_channel' };
      this.logger.debug(`intake ${result.reason} broadcaster=${broadcasterId}`);
      return result;
    }

    const hasSubscription = await this.database.accountHasSubscriptionAccess(
      accountId,
    );
    if (!hasSubscription) {
      const result = {
        action: 'ignored' as const,
        reason: 'subscription_expired',
      };
      this.logger.debug(`intake ${result.reason} account=${accountId}`);
      return result;
    }

    const message = event.content.trim();
    const session = await this.database.getChatRollForIntake(
      accountId,
      message,
    );
    if (!session) {
      const result = { action: 'ignored' as const, reason: 'keyword_mismatch' };
      this.logger.debug(
        `intake ${result.reason} account=${accountId} message="${message}"`,
      );
      return result;
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

    if (!session.isAcceptingParticipants) {
      return { action: 'entries_paused' };
    }

    const providerUserId = String(event.sender.user_id);
    const displayName = event.sender.username.trim();
    const roleIds = resolveKickChatRollRoleIds(event.sender.identity?.badges);

    if (!canJoinChatRollWithRoles(roleIds, session.roleSettings)) {
      const result = {
        action: 'ignored' as const,
        reason: 'role_not_allowed',
      };
      this.logger.debug(
        `intake ${result.reason} session=${session.id} name=${displayName} roles=${roleIds.join(',')}`,
      );
      return result;
    }

    const insertResult = await this.database.insertChatRollParticipantFromChat({
      chatRollId: session.id,
      provider: 'kick',
      providerUserId,
      displayName,
      roleIds,
    });

    if (insertResult.status === 'entries_paused') {
      return { action: 'entries_paused' };
    }

    if (insertResult.status === 'duplicate') {
      return { action: 'duplicate' };
    }

    if (session.replyInChat) {
      await this.chatReply.sendEntryConfirmation({
        broadcasterUserId: broadcasterId,
        displayName,
        replyToMessageId: event.message_id,
      });
    }

    const result = {
      action: 'participant_added' as const,
      displayName,
      replyInChat: session.replyInChat,
    };
    this.logger.log(
      `intake participant_added session=${session.id} name=${displayName}`,
    );
    return result;
  }
}
