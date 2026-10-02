import type {
  ChatRollIntakeResult,
  KickChatMessageEvent,
  KickChatRouteResult,
  WinnerResponseResult,
} from './kick-chat.types.js';

const CONTENT_PREVIEW_MAX = 160;

export function kickMessageAuditFields(
  event: KickChatMessageEvent,
): Record<string, string | number | boolean> {
  const content = event.content ?? '';
  const preview =
    content.length <= CONTENT_PREVIEW_MAX
      ? content
      : `${content.slice(0, CONTENT_PREVIEW_MAX)}…`;

  return {
    messageId: event.message_id,
    broadcasterUserId: String(event.broadcaster.user_id),
    senderUserId: String(event.sender.user_id),
    senderUsername: event.sender.username,
    contentLength: content.length,
    contentPreview: preview,
  };
}

export function formatKickRouteAudit(result: KickChatRouteResult): string {
  return JSON.stringify({
    winnerResponse: summarizeWinnerResponse(result.winnerResponse),
    intake: summarizeIntake(result.intake),
  });
}

function summarizeWinnerResponse(
  result: WinnerResponseResult,
): Record<string, string | number> {
  if (result.action === 'confirmed') {
    return { action: result.action, winId: result.winId };
  }
  return { action: result.action, reason: result.reason };
}

function summarizeIntake(
  result: ChatRollIntakeResult,
): Record<string, string | boolean> {
  if (result.action === 'participant_added') {
    return {
      action: result.action,
      displayName: result.displayName,
      replyInChat: result.replyInChat,
    };
  }
  if (result.action === 'ignored') {
    return { action: result.action, reason: result.reason };
  }
  return { action: result.action };
}

export function describeIntakePersistence(
  result: ChatRollIntakeResult,
  context: {
    messageId: string;
    chatRollId?: number;
    participantId?: number;
  },
): string {
  if (result.action === 'participant_added') {
    return `saved participant messageId=${context.messageId} chatRollId=${context.chatRollId ?? '?'} participantId=${context.participantId ?? '?'}`;
  }

  if (result.action === 'duplicate') {
    return `not saved participant (duplicate user) messageId=${context.messageId} chatRollId=${context.chatRollId ?? '?'}`;
  }

  if (result.action === 'entries_paused') {
    return `not saved participant (entries paused) messageId=${context.messageId} chatRollId=${context.chatRollId ?? '?'}`;
  }

  if (result.action === 'ignored') {
    const savedEvent =
      result.reason === 'duplicate_event'
        ? 'kick_chat_events not saved (duplicate message_id)'
        : result.reason === 'winner_response_confirmed'
          ? 'intake skipped (handled as winner response)'
          : 'kick_chat_events not saved (intake stopped before dedup insert)';
    return `${savedEvent}; reason=${result.reason}; messageId=${context.messageId}`;
  }

  return assertNever(result);
}

function assertNever(value: never): string {
  throw new Error(
    `Unhandled ChatRollIntakeResult: ${JSON.stringify(value)}`,
  );
}
