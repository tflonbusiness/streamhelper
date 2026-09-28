export type KickChatBadge = {
  type?: string;
  text?: string;
};

export type KickChatMessageEvent = {
  message_id: string;
  broadcaster: {
    user_id: number | string;
    username?: string;
  };
  sender: {
    user_id: number | string;
    username: string;
    is_anonymous?: boolean;
    identity?: {
      badges?: KickChatBadge[];
    };
  };
  content: string;
  created_at?: string;
};

export type KickWebhookHeaders = {
  messageId: string;
  timestamp: string;
  signature: string;
  eventType: string;
  eventVersion: string;
};

export type ChatRollIntakeResult =
  | { action: 'ignored'; reason: string }
  | { action: 'participant_added'; displayName: string; replyInChat: boolean }
  | { action: 'duplicate' }
  | { action: 'entries_paused' };

export type WinnerResponseResult =
  | { action: 'ignored'; reason: string }
  | { action: 'confirmed'; winId: number };

export type KickChatRouteResult = {
  winnerResponse: WinnerResponseResult;
  intake: ChatRollIntakeResult;
};
