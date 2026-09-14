import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { KickProfile } from './auth.types.js';

const KICK_AUTHORIZE_URL = 'https://id.kick.com/oauth/authorize';
const KICK_TOKEN_URL = 'https://id.kick.com/oauth/token';
const KICK_USERS_URL = 'https://api.kick.com/public/v1/users';
const KICK_CHANNELS_URL = 'https://api.kick.com/public/v1/channels';

export type KickOAuthRequest = {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
};

type KickTokenResponse = {
  access_token?: string;
};

type KickUserRecord = {
  user_id?: number | string;
  name?: string;
  username?: string;
};

type KickUsersResponse = {
  data?: KickUserRecord[];
};

type KickChannelRecord = {
  broadcaster_user_id?: number | string;
  slug?: string;
};

type KickChannelsResponse = {
  data?: KickChannelRecord[];
};

@Injectable()
export class KickOAuthService implements OnModuleInit {
  onModuleInit(): void {
    this.logStartupMode();
  }

  isMockMode(): boolean {
    return process.env.KICK_OAUTH_MOCK !== 'false';
  }

  logStartupMode(): void {
    if (this.isMockMode()) {
      console.warn(
        '[Kick OAuth] MOCK mode — requests stay local. Set KICK_OAUTH_MOCK=false in server/.env for real Kick.',
      );
      return;
    }

    const clientId = process.env.KICK_CLIENT_ID;
    if (!clientId || !process.env.KICK_CLIENT_SECRET) {
      console.error(
        '[Kick OAuth] Real mode enabled but KICK_CLIENT_ID / KICK_CLIENT_SECRET missing in server/.env',
      );
      return;
    }

    console.log(
      `[Kick OAuth] REAL mode — authorize → ${KICK_AUTHORIZE_URL}, callback token → ${KICK_TOKEN_URL}`,
    );
    console.log(`[Kick OAuth] redirect_uri=${this.getRedirectUri()}, client_id=${clientId}`);
  }

  describeAuthorizeTarget(request: KickOAuthRequest): string {
    if (this.isMockMode()) {
      return `mock:${this.getRedirectUri()}`;
    }
    return KICK_AUTHORIZE_URL;
  }

  getRedirectUri(): string {
    const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
    return (
      process.env.KICK_REDIRECT_URI ??
      `${appUrl.replace(/\/$/, '')}/auth/oauth/kick/callback`
    );
  }

  createOAuthRequest(): KickOAuthRequest {
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const state = randomBytes(16).toString('hex');

    return { state, codeVerifier, codeChallenge };
  }

  buildAuthorizeUrl(request: KickOAuthRequest): string {
    if (this.isMockMode()) {
      const params = new URLSearchParams({
        code: 'mock-kick-code',
        state: request.state,
      });
      return `${this.getRedirectUri()}?${params.toString()}`;
    }

    const clientId = process.env.KICK_CLIENT_ID;
    if (!clientId) {
      throw new BadRequestException('KICK_CLIENT_ID is not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      state: request.state,
      scope: 'user:read channel:read',
      code_challenge: request.codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${KICK_AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCodeForProfile(
    code: string,
    codeVerifier?: string,
  ): Promise<KickProfile> {
    if (this.isMockMode() || code === 'mock-kick-code') {
      return {
        providerUserId: 'kick-mock-user',
        username: 'kick_user_mock',
        channelId: 'channel-mock',
        channelSlug: 'kick_user_mock',
      };
    }

    if (!codeVerifier) {
      throw new UnauthorizedException('Missing OAuth code verifier');
    }

    const clientId = process.env.KICK_CLIENT_ID;
    const clientSecret = process.env.KICK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'KICK_CLIENT_ID and KICK_CLIENT_SECRET must be set when mock mode is disabled',
      );
    }

    console.log(`[Kick OAuth] token exchange → ${KICK_TOKEN_URL}`);

    const tokenResponse = await fetch(KICK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.getRedirectUri(),
        code,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      console.error(
        'Kick token exchange failed:',
        tokenResponse.status,
        detail,
      );
      throw new UnauthorizedException('Kick token exchange failed');
    }

    const tokenData = (await tokenResponse.json()) as KickTokenResponse;
    if (!tokenData.access_token) {
      throw new UnauthorizedException('Kick token response missing access_token');
    }

    return this.fetchProfile(tokenData.access_token);
  }

  private async fetchProfile(accessToken: string): Promise<KickProfile> {
    const userResponse = await fetch(KICK_USERS_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const detail = await userResponse.text();
      console.error('Kick user profile fetch failed:', userResponse.status, detail);
      throw new UnauthorizedException('Kick user profile fetch failed');
    }

    const userData = (await userResponse.json()) as KickUsersResponse;
    const user = userData.data?.[0];
    const username = (user?.name ?? user?.username ?? '').trim();
    if (!user?.user_id || !username) {
      throw new UnauthorizedException('Kick user profile is incomplete');
    }

    const providerUserId = String(user.user_id);
    const channel = await this.fetchChannel(accessToken, providerUserId, username);

    return {
      providerUserId,
      username,
      channelId: channel.channelId,
      channelSlug: channel.channelSlug,
    };
  }

  private async fetchChannel(
    accessToken: string,
    providerUserId: string,
    username: string,
  ): Promise<{ channelId: string; channelSlug: string }> {
    const byUserId = new URLSearchParams({ broadcaster_user_id: providerUserId });
    let channelResponse = await fetch(`${KICK_CHANNELS_URL}?${byUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!channelResponse.ok) {
      const slug = username.toLowerCase().replace(/\s+/g, '-');
      const bySlug = new URLSearchParams({ slug });
      channelResponse = await fetch(`${KICK_CHANNELS_URL}?${bySlug}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (channelResponse.ok) {
      const channelData = (await channelResponse.json()) as KickChannelsResponse;
      const channel = channelData.data?.[0];
      if (channel?.slug) {
        return {
          channelId: String(channel.broadcaster_user_id ?? providerUserId),
          channelSlug: channel.slug,
        };
      }
    }

    return {
      channelId: providerUserId,
      channelSlug: username.toLowerCase().replace(/\s+/g, '-'),
    };
  }
}
