import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type {
  SubscriptionAdminAccountDetail,
  SubscriptionAdminSearchItem,
  SubscriptionAdminUpdateBody,
} from './internal-subscriptions.types.js';

@Injectable()
export class InternalSubscriptionsService {
  constructor(private readonly database: DatabaseService) {}

  search(query: string): Promise<SubscriptionAdminSearchItem[]> {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      return Promise.resolve([]);
    }
    return this.database.searchSubscriptionAdminAccounts(trimmed);
  }

  async getDetail(accountId: number): Promise<SubscriptionAdminAccountDetail> {
    const detail =
      await this.database.getSubscriptionAdminAccountDetail(accountId);
    if (!detail) {
      throw new NotFoundException('Account not found');
    }
    return detail;
  }

  async updateSubscription(
    accountId: number,
    operatorUserId: number,
    body: SubscriptionAdminUpdateBody,
  ): Promise<SubscriptionAdminAccountDetail> {
    const normalized = this.normalizeUpdateBody(body);
    const updated = await this.database.applySubscriptionAdminUpdate(
      accountId,
      operatorUserId,
      normalized,
    );
    if (!updated) {
      throw new NotFoundException('Account not found');
    }

    console.info(
      JSON.stringify({
        event: 'subscription_admin_update',
        operatorUserId,
        targetAccountId: accountId,
        mode: normalized.mode,
        paidPlan: normalized.paidPlan,
        endsAt: normalized.endsAt?.toISOString(),
      }),
    );

    return updated;
  }

  private normalizeUpdateBody(body: SubscriptionAdminUpdateBody): {
    mode: SubscriptionAdminUpdateBody['mode'];
    paidPlan?: 'pro' | 'studio';
    endsAt?: Date;
    planTier: string;
  } {
    if (
      body.mode !== 'revoked' &&
      body.mode !== 'trial' &&
      body.mode !== 'paid'
    ) {
      throw new BadRequestException('Invalid mode');
    }

    const planTier = body.planTier?.trim() || 'full';

    if (body.mode === 'revoked') {
      return { mode: 'revoked', planTier };
    }

    if (!body.endsAt?.trim()) {
      throw new BadRequestException('endsAt is required for trial and paid');
    }

    const endsAt = new Date(body.endsAt);
    if (Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid endsAt');
    }

    if (endsAt.getTime() <= Date.now()) {
      throw new BadRequestException('endsAt must be in the future');
    }

    if (body.mode === 'trial') {
      return { mode: 'trial', endsAt, planTier };
    }

    const paidPlan = body.paidPlan;
    if (paidPlan !== 'pro' && paidPlan !== 'studio') {
      throw new BadRequestException('paidPlan must be pro or studio');
    }

    return { mode: 'paid', paidPlan, endsAt, planTier };
  }
}
