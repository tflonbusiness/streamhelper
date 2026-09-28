import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { mapKickBadgesToRoleIds } from '../kick-badge.mapper.js';
import { KickChatReplyService } from '../kick-chat-reply.service.js';
import type {
  ChatRollIntakeResult,
  KickChatMessageEvent,
} from '../kick-chat.types.js';

@Injectable()
export class ChatRollIntakeHandler {
  constructor(
    private readonly database: DatabaseService,
    private readonly chatReply: KickChatReplyService,
  ) {}

  async handle(event: KickChatMessageEvent): Promise<ChatRollIntakeResult> {
    console.log('chat-roll-intake-handler', event);
    console.log('chat-roll-intake-handler', event.sender?.identity?.badges);

    const broadcasterId = String(event.broadcaster.user_id);
    const accountId = await this.database.getAccountIdByKickChannelId(
      broadcasterId,
    );
    if (!accountId) {
      return { action: 'ignored', reason: 'unknown_channel' };
    }

    const session = await this.database.getLiveChatRollForIntake(accountId);
    if (!session) {
      return { action: 'ignored', reason: 'no_live_session' };
    }

    const message = event.content.trim();
    if (
      message.toLowerCase() !== session.keyword.trim().toLowerCase()
    ) {
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

    if (!session.isAcceptingParticipants) {
      return { action: 'entries_paused' };
    }

    const providerUserId = String(event.sender.user_id);
    const displayName = event.sender.username.trim();
    const roleIds = mapKickBadgesToRoleIds(event.sender.identity?.badges);

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

    return {
      action: 'participant_added',
      displayName,
      replyInChat: session.replyInChat,
    };
  }
}
