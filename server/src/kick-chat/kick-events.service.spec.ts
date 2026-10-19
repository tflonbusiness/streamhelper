import {
  KICK_CHANNEL_WEBHOOK_EVENTS,
  KickEventsService,
} from './kick-events.service.js';

describe('KickEventsService', () => {
  it('includes chat and channel reward redemption webhook events', () => {
    const names = KICK_CHANNEL_WEBHOOK_EVENTS.map((e) => e.name);
    expect(names).toContain('chat.message.sent');
    expect(names).toContain('channel.reward.redemption.updated');
    expect(names).toContain('channel.reward.redemption.created');
  });

  it('mock mode logs subscription without calling Kick API', async () => {
    const previous = process.env.KICK_CHAT_MOCK;
    process.env.KICK_CHAT_MOCK = 'true';
    const service = new KickEventsService();
    const logSpy = vi.spyOn(service['logger'], 'log').mockImplementation(() => {});

    await service.subscribeToChannelWebhooks({
      broadcasterUserId: '12345',
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('channel.reward.redemption.updated'),
    );
    logSpy.mockRestore();
    if (previous === undefined) {
      delete process.env.KICK_CHAT_MOCK;
    } else {
      process.env.KICK_CHAT_MOCK = previous;
    }
  });
});
