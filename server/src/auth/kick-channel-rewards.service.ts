import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { KickOAuthService } from './kick-oauth.service.js';

const KICK_REWARDS_URL = 'https://api.kick.com/public/v1/channels/rewards';

export type KickChannelRewardOption = {
  id: string;
  title: string;
  cost: number;
  description: string;
  isEnabled: boolean;
  isUserInputRequired: boolean;
};

type KickRewardsResponse = {
  data?: Array<{
    id?: string;
    title?: string;
    cost?: number;
    description?: string;
    is_enabled?: boolean;
    is_user_input_required?: boolean;
  }>;
};

@Injectable()
export class KickChannelRewardsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly kickOAuth: KickOAuthService,
  ) {}

  async listRewardsForAccount(
    accountId: number,
    userId: number,
  ): Promise<KickChannelRewardOption[]> {
    const ok = await this.database.hasActiveMembership(accountId, userId);
    if (!ok) {
      throw new ForbiddenException('Not a member of this account');
    }

    if (this.kickOAuth.isMockMode()) {
      return [
        {
          id: 'mock-reward-song',
          title: 'Order a song (mock)',
          cost: 100,
          description: 'Paste a YouTube link',
          isEnabled: true,
          isUserInputRequired: true,
        },
      ];
    }

    const accessToken = await this.resolveOwnerAccessToken(accountId);
    const response = await fetch(KICK_REWARDS_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new ServiceUnavailableException(
        `Kick channel rewards unavailable (${response.status}): ${detail}`,
      );
    }

    const payload = (await response.json()) as KickRewardsResponse;
    const rows = payload.data ?? [];
    return rows
      .filter((row) => Boolean(row.id && row.title))
      .map((row) => ({
        id: String(row.id),
        title: String(row.title),
        cost: Number(row.cost ?? 0),
        description: String(row.description ?? ''),
        isEnabled: Boolean(row.is_enabled),
        isUserInputRequired: Boolean(row.is_user_input_required),
      }))
      .sort((a, b) => a.cost - b.cost || a.title.localeCompare(b.title));
  }

  private async resolveOwnerAccessToken(accountId: number): Promise<string> {
    const stored = await this.database.getKickOAuthTokensForAccountOwner(
      accountId,
    );
    if (!stored?.accessToken) {
      throw new ForbiddenException(
        'Kick authorization expired — sign in with Kick again to load channel rewards',
      );
    }

    const expiresAt = stored.expiresAt?.getTime() ?? 0;
    const needsRefresh =
      stored.refreshToken &&
      (expiresAt === 0 || expiresAt < Date.now() + 60_000);

    if (!needsRefresh) {
      return stored.accessToken;
    }

    const refreshed = await this.kickOAuth.refreshUserAccessToken(
      stored.refreshToken!,
    );
    await this.database.saveKickOAuthTokens(stored.userId, {
      accessToken: refreshed.accessToken,
      refreshToken:
        refreshed.refreshToken ?? stored.refreshToken ?? undefined,
      expiresAt: refreshed.expiresAt,
    });
    return refreshed.accessToken;
  }
}
