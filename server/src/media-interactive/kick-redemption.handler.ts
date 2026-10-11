import { Injectable, Logger } from '@nestjs/common';
import { MediaInteractiveService } from './media-interactive.service.js';

@Injectable()
export class KickRedemptionHandler {
  private readonly logger = new Logger(KickRedemptionHandler.name);

  constructor(private readonly mediaInteractive: MediaInteractiveService) {}

  async handleRedemptionUpdated(body: unknown): Promise<void> {
    const parsed = this.parsePayload(body);
    if (!parsed) {
      this.logger.warn('ignored redemption payload: unparseable');
      return;
    }

    const result = await this.mediaInteractive.handleKickRedemption(parsed);
    if (!result) {
      this.logger.debug(
        `redemption reward ${parsed.rewardId} not mapped to youtube media`,
      );
      return;
    }

    this.logger.log(
      `youtube media redemption account=${result.accountId} item=${result.item.id} status=${result.item.status}`,
    );
  }

  private parsePayload(body: unknown): {
    redemptionId: string;
    rewardId: string;
    userInput: string;
    requesterNick: string;
    pointsCharged: number;
  } | null {
    if (!body || typeof body !== 'object') {
      return null;
    }
    const root = body as Record<string, unknown>;
    const redemptionId = String(
      root.id ?? root.redemption_id ?? root.redemptionId ?? '',
    );
    const reward = root.reward as Record<string, unknown> | undefined;
    const user = root.user as Record<string, unknown> | undefined;
    const redeemer = root.redeemer as Record<string, unknown> | undefined;

    const rewardId = String(
      root.reward_id ?? root.rewardId ?? reward?.id ?? '',
    );
    const userInput = String(
      root.user_input ??
        root.input ??
        root.message ??
        reward?.user_input ??
        '',
    ).trim();
    const requesterNick = String(
      root.username ?? user?.username ?? redeemer?.username ?? 'viewer',
    );
    const pointsCharged = Number(
      root.channel_points_cost ?? root.cost ?? reward?.channel_points_cost ?? 0,
    );

    if (!redemptionId || !rewardId) {
      return null;
    }

    return {
      redemptionId,
      rewardId,
      userInput,
      requesterNick,
      pointsCharged: Number.isFinite(pointsCharged) ? pointsCharged : 0,
    };
  }
}
