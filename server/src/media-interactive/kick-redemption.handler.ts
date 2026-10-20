import { Injectable, Logger } from '@nestjs/common';
import { logKickDev } from '../kick-chat/kick-webhook-dev-log.js';
import { MediaInteractiveService } from './media-interactive.service.js';

@Injectable()
export class KickRedemptionHandler {
  private readonly logger = new Logger(KickRedemptionHandler.name);

  constructor(private readonly mediaInteractive: MediaInteractiveService) {}

  async handleRedemptionUpdated(body: unknown): Promise<void> {
    const parsed = this.parsePayload(body);
    if (!parsed) {
      this.logger.warn('ignored redemption payload: unparseable');
      logKickDev('action media_interactive.redemption ignored', {
        reason: 'unparseable_payload',
      });
      return;
    }

    const result = await this.mediaInteractive.handleKickRedemption(parsed);
    if (result.kind === 'ignored') {
      this.logger.debug(
        `redemption ignored reason=${result.reason} broadcaster=${parsed.broadcasterUserId} reward=${parsed.rewardId}`,
      );
      logKickDev('action media_interactive.redemption ignored', {
        reason: result.reason,
        broadcasterUserId: parsed.broadcasterUserId,
        rewardId: parsed.rewardId,
        redemptionId: parsed.redemptionId,
      });
      return;
    }

    this.logger.log(
      `youtube media redemption account=${result.accountId} item=${result.item.id} status=${result.item.status}`,
    );
    logKickDev('action media_interactive.redemption enqueued', {
      accountId: result.accountId,
      itemId: result.item.id,
      status: result.item.status,
      rewardId: parsed.rewardId,
      redemptionId: parsed.redemptionId,
      pointsCharged: parsed.pointsCharged,
      requesterNick: parsed.requesterNick,
    });
  }

  private parsePayload(body: unknown): {
    redemptionId: string;
    rewardId: string;
    broadcasterUserId: string;
    userInput: string;
    requesterNick: string;
    pointsCharged: number;
  } | null {
    if (!body || typeof body !== 'object') {
      return null;
    }
    const envelope = body as Record<string, unknown>;
    const nested = envelope.data ?? envelope.event ?? envelope.payload;
    const root =
      nested && typeof nested === 'object'
        ? (nested as Record<string, unknown>)
        : envelope;
    const redemptionId = String(
      root.id ?? root.redemption_id ?? root.redemptionId ?? '',
    );
    const reward = root.reward as Record<string, unknown> | undefined;
    const user = root.user as Record<string, unknown> | undefined;
    const redeemer = root.redeemer as Record<string, unknown> | undefined;
    const broadcaster = root.broadcaster as Record<string, unknown> | undefined;
    const channel = root.channel as Record<string, unknown> | undefined;

    const envelopeBroadcaster = envelope.broadcaster as
      | Record<string, unknown>
      | undefined;
    const broadcasterUserId = String(
      root.broadcaster_user_id ??
        envelope.broadcaster_user_id ??
        broadcaster?.user_id ??
        envelopeBroadcaster?.user_id ??
        channel?.id ??
        channel?.user_id ??
        reward?.channel_id ??
        '',
    ).trim();

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
      root.channel_points_cost ??
        root.cost ??
        reward?.cost ??
        reward?.channel_points_cost ??
        0,
    );

    if (!redemptionId || !rewardId) {
      return null;
    }

    if (!broadcasterUserId) {
      this.logger.warn(
        `redemption payload missing broadcaster id redemptionId=${redemptionId} rewardId=${rewardId}`,
      );
      return null;
    }

    return {
      redemptionId,
      rewardId,
      broadcasterUserId,
      userInput,
      requesterNick,
      pointsCharged: Number.isFinite(pointsCharged) ? pointsCharged : 0,
    };
  }
}
