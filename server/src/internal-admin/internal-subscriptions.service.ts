import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import {
  SUBSCRIPTION_ADMIN_SORT_FIELDS,
  type SubscriptionAdminAccountDetail,
  type SubscriptionAdminSearchQuery,
  type SubscriptionAdminSearchResult,
  type SubscriptionAdminSortField,
  type SubscriptionAdminSortOrder,
  type SubscriptionAdminUpdateBody,
} from './internal-subscriptions.types.js';

@Injectable()
export class InternalSubscriptionsService {
  constructor(private readonly database: DatabaseService) {}

  search(query: SubscriptionAdminSearchQuery): Promise<SubscriptionAdminSearchResult> {
    const page = Math.max(1, Math.floor(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize) || 20));
    const sortBy = this.parseSortField(query.sortBy);
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return this.database.searchSubscriptionAdminAccounts({
      query: query.q.trim(),
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  }

  private parseSortField(value: string | undefined): SubscriptionAdminSortField {
    if (
      value &&
      (SUBSCRIPTION_ADMIN_SORT_FIELDS as readonly string[]).includes(value)
    ) {
      return value as SubscriptionAdminSortField;
    }
    return 'updatedAt';
  }

  parseSearchQuery(input: {
    q?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
  }): SubscriptionAdminSearchQuery {
    const page = Math.max(1, Number.parseInt(input.page ?? '1', 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(input.pageSize ?? '20', 10) || 20),
    );
    const sortOrder: SubscriptionAdminSortOrder =
      input.sortOrder === 'asc' ? 'asc' : 'desc';

    return {
      q: input.q ?? '',
      page,
      pageSize,
      sortBy: this.parseSortField(input.sortBy),
      sortOrder,
    };
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
    paidPlan?: 'pro' | 'max';
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

    const planTierFromBody = body.planTier?.trim();
    if (body.mode === 'revoked') {
      return { mode: 'revoked', planTier: planTierFromBody || 'trial' };
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
      return { mode: 'trial', endsAt, planTier: planTierFromBody || 'trial' };
    }

    const paidPlan = body.paidPlan;
    if (paidPlan !== 'pro' && paidPlan !== 'max') {
      throw new BadRequestException('paidPlan must be pro or max');
    }

    return {
      mode: 'paid',
      paidPlan,
      endsAt,
      planTier: planTierFromBody || paidPlan,
    };
  }
}
