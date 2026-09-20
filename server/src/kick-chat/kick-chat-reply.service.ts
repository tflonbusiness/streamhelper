import { Injectable, Logger } from '@nestjs/common';

const KICK_CHAT_URL = 'https://api.kick.com/public/v1/chat';
const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';

@Injectable()
export class KickChatReplyService {
  private readonly logger = new Logger(KickChatReplyService.name);
  private cachedAppToken: { token: string; expiresAt: number } | null = null;

  isMockMode(): boolean {
    return process.env.KICK_CHAT_MOCK === 'true';
  }

  async sendEntryConfirmation(input: {
    broadcasterUserId: string;
    displayName: string;
    replyToMessageId?: string;
  }): Promise<void> {
    const content = `@${input.displayName}, you're in the giveaway!`;

    if (this.isMockMode()) {
      this.logger.log(
        `[mock] chat reply → ${input.broadcasterUserId}: ${content}`,
      );
      return;
    }

    const accessToken = await this.getAppAccessToken();
    const response = await fetch(KICK_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        broadcaster_user_id: Number(input.broadcasterUserId),
        content,
        type: 'bot',
        reply_to_message_id: input.replyToMessageId,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      this.logger.warn(
        `Kick chat reply failed (${response.status}): ${detail}`,
      );
    }
  }

  private async getAppAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedAppToken && this.cachedAppToken.expiresAt > now) {
      return this.cachedAppToken.token;
    }

    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('Kick app credentials not configured for chat replies');
    }

    const tokenResponse = await fetch(KICK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      throw new Error(`Kick app token failed: ${tokenResponse.status} ${detail}`);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!tokenData.access_token) {
      throw new Error('Kick app token missing access_token');
    }

    const ttlMs = (tokenData.expires_in ?? 3600) * 1000;
    this.cachedAppToken = {
      token: tokenData.access_token,
      expiresAt: now + ttlMs - 60_000,
    };

    return tokenData.access_token;
  }
}
