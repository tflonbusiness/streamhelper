export type AccountSubscriptionSession = {
  status: 'active' | 'expired' | 'cancelled';
  planTier: string;
  endsAt: string;
  hasAccess: boolean;
};

export type LoginSurface = 'streamer' | 'service';

export type SessionUser = {
  id: number;
  name: string;
  accountId?: number;
  accountUcid?: string;
  accountName?: string;
  role?: 'owner' | 'moderator';
  subscriptionPlan?: string;
  subscription?: AccountSubscriptionSession;
  channelSlug?: string;
  platformAdmin?: boolean;
};

export type SessionData = {
  user?: SessionUser;
  loginSurface?: LoginSurface;
  kickOAuth?: {
    state: string;
    codeVerifier: string;
  };
};

export type KickProfile = {
  providerUserId: string;
  username: string;
  channelId: string;
  channelSlug: string;
};

export type KickOAuthExchangeResult = {
  profile: KickProfile;
  accessToken?: string;
};

export type CreateModeratorResult = {
  userId: number;
  name: string;
  joinUrl: string;
};
