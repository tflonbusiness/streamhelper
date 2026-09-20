import { Injectable, Logger } from '@nestjs/common';

const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
const KICK_SUBSCRIPTIONS_URL =
  'https://api.kick.com/public/v1/events/subscriptions';

@Injectable()
export class KickEventsService {
  private readonly logger = new Logger(KickEventsService.name);
  private cachedAppToken: { token: string; expiresAt: number } | null = null;

  isMockMode(): boolean {
    return process.env.KICK_CHAT_MOCK === 'true';
  }

  async subscribeToChatMessages(input: {
    broadcasterUserId: string;
    userAccessToken?: string;
  }): Promise<void> {
    if (this.isMockMode()) {
      this.logger.log(
        `[mock] subscribed to chat.message.sent for broadcaster ${input.broadcasterUserId}`,
      );
      return;
    }

    const events = [{ name: 'chat.message.sent', version: 1 }];
    const method = 'webhook';

    if (input.userAccessToken) {
      const userResult = await this.postSubscription({
        accessToken: input.userAccessToken,
        body: { events, method },
        label: `user token (broadcaster ${input.broadcasterUserId})`,
      });
      if (userResult) {
        return;
      }
      this.logger.warn(
        'User-token subscription failed; retrying with app access token',
      );
    }

    const broadcasterUserId = Number.parseInt(input.broadcasterUserId, 10);
    if (!Number.isFinite(broadcasterUserId)) {
      this.logger.warn(
        `Kick event subscription skipped: invalid broadcaster_user_id "${input.broadcasterUserId}"`,
      );
      return;
    }

    const appToken = await this.getAppAccessToken();
    await this.postSubscription({
      accessToken: appToken,
      body: {
        broadcaster_user_id: broadcasterUserId,
        events,
        method,
      },
      label: `app token (broadcaster ${broadcasterUserId})`,
    });
  }

  private async postSubscription(input: {
    accessToken: string;
    body: Record<string, unknown>;
    label: string;
  }): Promise<boolean> {
    const response = await fetch(KICK_SUBSCRIPTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input.body),
    });

    if (!response.ok) {
      const detail = await response.text();
      this.logger.warn(
        `Kick event subscription failed (${response.status}) via ${input.label}: ${detail}`,
      );
      return false;
    }

    this.logger.log(
      `Subscribed to chat.message.sent via ${input.label}: ${await response.text()}`,
    );
    return true;
  }

  private async getAppAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedAppToken && this.cachedAppToken.expiresAt > now) {
      return this.cachedAppToken.token;
    }

    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('Kick app credentials not configured');
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
