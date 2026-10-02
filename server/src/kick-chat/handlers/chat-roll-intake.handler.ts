import { Injectable, Logger } from '@nestjs/common';
import { canJoinChatRollWithRoles } from '../../chat-roll/chat-roll-utils.js';
import { DatabaseService } from '../../database/database.service.js';
import { describeIntakePersistence } from '../kick-chat-audit.js';
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
    const messageId = event.message_id;
    const broadcasterId = String(event.broadcaster.user_id);
    const accountId = await this.database.getAccountIdByKickChannelId(
      broadcasterId,
    );
    if (!accountId) {
      const result = { action: 'ignored' as const, reason: 'unknown_channel' };
      this.logSkipped(messageId, result, {
        broadcasterId,
        detail: 'no account_channels row for broadcaster',
      });
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
      this.logSkipped(messageId, result, { accountId });
      return result;
    }

    const message = event.content.trim();
    const session = await this.database.getChatRollForIntake(
      accountId,
      message,
    );
    if (!session) {
      const result = { action: 'ignored' as const, reason: 'keyword_mismatch' };
      this.logSkipped(messageId, result, {
        accountId,
        trimmedContent: message,
        detail: 'no live chat_roll with matching keyword',
      });
      return result;
    }

    const isNew = await this.database.recordKickChatEvent({
      messageId: event.message_id,
      broadcasterId,
      senderId: String(event.sender.user_id),
      content: event.content,
    });
    if (!isNew) {
      const result = { action: 'ignored' as const, reason: 'duplicate_event' };
      this.logger.log(
        `${describeIntakePersistence(result, { messageId })} accountId=${accountId} chatRollId=${session.id}`,
      );
      return result;
    }

    this.logger.log(
      `saved kick_chat_events messageId=${messageId} accountId=${accountId} chatRollId=${session.id} broadcasterId=${broadcasterId} senderId=${String(event.sender.user_id)}`,
    );

    if (!session.isAcceptingParticipants) {
      const result = { action: 'entries_paused' as const };
      this.logger.log(
        `${describeIntakePersistence(result, { messageId, chatRollId: session.id })} accountId=${accountId}`,
      );
      return result;
    }

    const providerUserId = String(event.sender.user_id);
    const displayName = event.sender.username.trim();
    const roleIds = resolveKickChatRollRoleIds(event.sender.identity?.badges);

    if (!canJoinChatRollWithRoles(roleIds, session.roleSettings)) {
      const result = {
        action: 'ignored' as const,
        reason: 'role_not_allowed',
      };
      this.logger.log(
        `${describeIntakePersistence(result, { messageId, chatRollId: session.id })} accountId=${accountId} displayName=${displayName} roles=${roleIds.join(',')}`,
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
      const result = { action: 'entries_paused' as const };
      this.logger.log(
        `${describeIntakePersistence(result, { messageId, chatRollId: session.id })} accountId=${accountId}`,
      );
      return result;
    }

    if (insertResult.status === 'duplicate') {
      const result = { action: 'duplicate' as const };
      this.logger.log(
        `${describeIntakePersistence(result, { messageId, chatRollId: session.id })} accountId=${accountId} providerUserId=${providerUserId}`,
      );
      return result;
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
      `${describeIntakePersistence(result, {
        messageId,
        chatRollId: session.id,
        participantId: insertResult.participantId,
      })} accountId=${accountId}`,
    );
    return result;
  }

  private logSkipped(
    messageId: string,
    result: { action: 'ignored'; reason: string },
    context: Record<string, string | number>,
  ): void {
    this.logger.log(
      `${describeIntakePersistence(result, { messageId })} ${JSON.stringify(context)}`,
    );
  }
}
