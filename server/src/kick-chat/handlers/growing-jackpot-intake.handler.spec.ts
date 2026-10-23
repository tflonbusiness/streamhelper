import { GrowingJackpotIntakeHandler } from './growing-jackpot-intake.handler.js';
import type { KickChatMessageEvent } from '../kick-chat.types.js';

function baseEvent(content: string): KickChatMessageEvent {
  return {
    message_id: 'msg-1',
    broadcaster: { user_id: 'channel-mock' },
    sender: {
      user_id: 'viewer-9',
      username: 'joiner',
      identity: { badges: [] },
    },
    content,
  };
}

describe('GrowingJackpotIntakeHandler', () => {
  const database = {
    getAccountIdByKickChannelId: async () => 10,
    accountHasSubscriptionAccess: async () => true,
  };

  it('ignores duplicate chat events', async () => {
    const handler = new GrowingJackpotIntakeHandler(
      database as never,
      { getIntakeContext: async () => null } as never,
    );
    const result = await handler.handle(baseEvent('!join'), {
      duplicateChatEvent: true,
    });
    expect(result).toEqual({ action: 'ignored', reason: 'duplicate_event' });
  });

  it('adds participant when keyword matches', async () => {
    const growingJackpot = {
      getIntakeContext: async () => ({
        growingJackpotId: 2,
        roundId: 5,
        joinKeyword: '!join',
        settings: {
          roleSettings: {
            moderator: { enabled: false, weight: 1 },
            vip: { enabled: true, weight: 1 },
            og: { enabled: false, weight: 1 },
            viewer: { enabled: true, weight: 1 },
            paid_subscriber: { enabled: true, weight: 1 },
          },
        },
      }),
      matchesKeyword: (message: string, keyword: string) =>
        message.trim().toLowerCase() === keyword.trim().toLowerCase(),
      tryJoinFromChat: async () => ({
        status: 'created' as const,
        participantCount: 2,
        displayPrize: 3,
      }),
    };

    const handler = new GrowingJackpotIntakeHandler(
      database as never,
      growingJackpot as never,
    );

    const result = await handler.handle(baseEvent('!join'), {
      duplicateChatEvent: false,
    });
    expect(result).toEqual({
      action: 'participant_added',
      displayName: 'joiner',
      participantCount: 2,
    });
  });

  it('ignores when account has no subscription access', async () => {
    const handler = new GrowingJackpotIntakeHandler(
      {
        ...database,
        accountHasSubscriptionAccess: async () => false,
      } as never,
      { getIntakeContext: async () => null } as never,
    );
    const result = await handler.handle(baseEvent('!join'), {
      duplicateChatEvent: false,
    });
    expect(result).toEqual({
      action: 'ignored',
      reason: 'subscription_expired',
    });
  });

  it('ignores when no active round context', async () => {
    const handler = new GrowingJackpotIntakeHandler(
      database as never,
      { getIntakeContext: async () => null } as never,
    );
    const result = await handler.handle(baseEvent('!join'), {
      duplicateChatEvent: false,
    });
    expect(result).toEqual({ action: 'ignored', reason: 'no_accepting_round' });
  });

  it('ignores keyword mismatch', async () => {
    const growingJackpot = {
      getIntakeContext: async () => ({
        growingJackpotId: 2,
        roundId: 5,
        joinKeyword: '!pool',
        settings: {
          roleSettings: {
            viewer: { enabled: true, weight: 1 },
          },
        },
      }),
      matchesKeyword: () => false,
      tryJoinFromChat: async () => ({ status: 'created' as const }),
    };

    const handler = new GrowingJackpotIntakeHandler(
      database as never,
      growingJackpot as never,
    );

    const result = await handler.handle(baseEvent('!join'), {
      duplicateChatEvent: false,
    });
    expect(result).toEqual({ action: 'ignored', reason: 'keyword_mismatch' });
  });
});
