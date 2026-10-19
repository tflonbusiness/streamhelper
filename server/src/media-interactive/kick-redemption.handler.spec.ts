import { KickRedemptionHandler } from './kick-redemption.handler.js';
import { MediaInteractiveService } from './media-interactive.service.js';

describe('KickRedemptionHandler', () => {
  it('routes redemption using broadcaster on nested payload', async () => {
    const handleKickRedemption = vi.fn().mockResolvedValue({
      kind: 'ok',
      accountId: 1,
      item: { id: 9, status: 'queued' },
    });
    const handler = new KickRedemptionHandler({
      handleKickRedemption,
    } as unknown as MediaInteractiveService);

    await handler.handleRedemptionUpdated({
      data: {
        id: 'redemption-1',
        reward_id: 'reward-1',
        broadcaster_user_id: '4242',
        user_input: 'https://www.youtube.com/watch?v=test',
        username: 'viewer',
        channel_points_cost: 50,
      },
    });

    expect(handleKickRedemption).toHaveBeenCalledWith(
      expect.objectContaining({
        redemptionId: 'redemption-1',
        rewardId: 'reward-1',
        broadcasterUserId: '4242',
      }),
    );
  });
});
