export type SessionUser = {
  id: number;
  name: string;
  accountId?: number;
  accountName?: string;
  role?: 'owner' | 'moderator';
  subscriptionPlan?: string;
};

export type SessionData = {
  user?: SessionUser;
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

export type CreateModeratorResult = {
  userId: number;
  name: string;
  joinUrl: string;
};
