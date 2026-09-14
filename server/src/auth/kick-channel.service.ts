import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { KickOAuthService } from './kick-oauth.service.js';
import type { KickChannelDto } from './kick-channel.types.js';

const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
const KICK_CHANNELS_URL = 'https://api.kick.com/public/v1/channels';

type KickTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type KickStreamUpstream = {
  is_live?: boolean;
  is_mature?: boolean;
  viewer_count?: number;
  thumbnail?: string;
};

type KickChannelUpstream = {
  slug?: string;
  stream_title?: string;
  channel_description?: string;
  banner_picture?: string;
  active_subscribers_count?: number;
  active_gifted_subscribers_count?: number;
  category?: { name?: string };
  stream?: KickStreamUpstream;
};

type KickChannelsResponse = {
  data?: KickChannelUpstream[];
};

@Injectable()
export class KickChannelService {
  private cachedAppToken: { token: string; expiresAt: number } | null = null;

  constructor(
    private readonly database: DatabaseService,
    private readonly kickOAuth: KickOAuthService,
  ) {}

  async getChannelForAccount(accountId: number): Promise<KickChannelDto> {
    const channel = await this.database.getPrimaryKickChannel(accountId);
    if (!channel) {
      throw new NotFoundException('Kick channel not connected');
    }

    if (this.kickOAuth.isMockMode()) {
      return this.getMockChannel();
    }

    const accessToken = await this.getAppAccessToken();
    const upstream = await this.fetchUpstreamChannel(
      accessToken,
      channel.channelSlug,
      channel.channelId,
    );

    if (!upstream) {
      throw new NotFoundException('Kick channel not found');
    }

    return this.mapUpstream(upstream);
  }

  private getMockChannel(): KickChannelDto {
    return {
      slug: 'kick_user_mock',
      streamTitle: 'CasinoStream demo stream',
      channelDescription: 'Development test channel',
      bannerPicture: null,
      categoryName: 'Slots & Casino',
      isLive: false,
      isMature: false,
      viewerCount: null,
      streamThumbnail: null,
      activeSubscribersCount: 0,
      activeGiftedSubscribersCount: 0,
    };
  }

  private async getAppAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedAppToken && this.cachedAppToken.expiresAt > now) {
      return this.cachedAppToken.token;
    }

    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Kick app credentials not configured');
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
      console.error('Kick app token failed:', tokenResponse.status, detail);
      throw new ServiceUnavailableException('Kick app token unavailable');
    }

    const tokenData = (await tokenResponse.json()) as KickTokenResponse;
    if (!tokenData.access_token) {
      throw new ServiceUnavailableException('Kick app token missing access_token');
    }

    const ttlMs = (tokenData.expires_in ?? 3600) * 1000;
    this.cachedAppToken = {
      token: tokenData.access_token,
      expiresAt: now + ttlMs - 60_000,
    };

    return tokenData.access_token;
  }

  private async fetchUpstreamChannel(
    accessToken: string,
    channelSlug: string,
    channelId: string,
  ): Promise<KickChannelUpstream | null> {
    const bySlug = new URLSearchParams({ slug: channelSlug });
    let response = await fetch(`${KICK_CHANNELS_URL}?${bySlug}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const byUserId = new URLSearchParams({ broadcaster_user_id: channelId });
      response = await fetch(`${KICK_CHANNELS_URL}?${byUserId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (!response.ok) {
      const detail = await response.text();
      console.error('Kick channels fetch failed:', response.status, detail);
      return null;
    }

    const payload = (await response.json()) as KickChannelsResponse;
    return payload.data?.[0] ?? null;
  }

  private mapUpstream(channel: KickChannelUpstream): KickChannelDto {
    const isLive = Boolean(channel.stream?.is_live);

    return {
      slug: channel.slug ?? '',
      streamTitle: channel.stream_title ?? null,
      channelDescription: truncate(channel.channel_description, 200),
      bannerPicture: channel.banner_picture ?? null,
      categoryName: channel.category?.name ?? null,
      isLive,
      isMature: Boolean(channel.stream?.is_mature),
      viewerCount: isLive ? (channel.stream?.viewer_count ?? null) : null,
      streamThumbnail: isLive ? (channel.stream?.thumbnail ?? null) : null,
      activeSubscribersCount: channel.active_subscribers_count ?? null,
      activeGiftedSubscribersCount:
        channel.active_gifted_subscribers_count ?? null,
    };
  }
}

function truncate(text: string | undefined, max: number): string | null {
  if (!text?.trim()) {
    return null;
  }
  const trimmed = text.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}
