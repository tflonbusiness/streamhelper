import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import type { KickProfile } from '../auth/auth.types.js';
import {
  computeMultiplier,
  normalizeMoney,
  normalizePositiveMoney,
} from '../bonus-buy/bonus-buy-math.js';
import { normalizeCurrencyCode } from '../bonus-buy/iso-currencies.js';
import {
  BONUS_BUY_SYSTEM_PRESET_SEEDS,
  BONUS_BUY_WIDGET_DIMENSION_DEFAULTS,
  BONUS_BUY_WIDGET_STYLE_DEFAULTS,
  type BonusBuyWidgetStyleSettings,
} from '../bonus-buy/bonus-buy-widget-defaults.js';
import {
  bonusBuyWidgetInsertParams,
  BONUS_BUY_WIDGET_INSERT_SQL,
} from '../bonus-buy/bonus-buy-widget-insert.js';
import {
  parseBonusBuyWidgetStyleSettings,
} from '../bonus-buy/bonus-buy-widget-style.js';
import {
  computeParticipantCoefficient,
  DEFAULT_CHAT_ROLL_ROLE_SETTINGS,
  normalizeKeyword,
  normalizeRoleSettings,
  normalizeWidgetKeywordPrefix,
  pickWeightedParticipant,
  type ChatRollRoleSettings,
} from '../chat-roll/chat-roll-utils.js';
import { CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT } from '../chat-roll/chat-roll-widget.constants.js';
import { initialSessionStatusOnCreate } from '../session-lifecycle/initial-session-status-on-create.js';
import {
  CHAT_ROLL_WIDGET_INSERT_SQL,
  chatRollWidgetInsertParams,
} from '../chat-roll/chat-roll-widget-defaults.js';
import {
  PRIZE_SPIN_WIDGET_DEFAULTS,
  PRIZE_SPIN_WIDGET_INSERT_SQL,
  prizeSpinWidgetInsertParams,
} from '../prize-spin/prize-spin-widget-defaults.js';
import {
  defaultSectorColor,
  equalWinPercents,
  normalizeHexColor,
  normalizeWinPercent,
  pickWeightedSectorId,
  isCompleteWinPercentTotal,
} from '../prize-spin/prize-spin-sector-utils.js';
import {
  generateAccessToken,
  hashAccessToken,
  providerUserIdForAccessLink,
  verifyAccessToken,
} from '../auth/token.util.js';
import { runMigrations } from './run-migrations.js';
import { TRIAL_DURATION_DAYS } from '../subscriptions/account-subscription.constants.js';
import type { EntitlementUsage } from '../subscriptions/plan-entitlements.js';
import {
  resolveAccountSubscriptionAccess,
  shouldMarkSubscriptionExpired,
  type AccountSubscriptionRow,
  type AccountSubscriptionSnapshot,
} from '../subscriptions/account-subscription-access.js';

export type DbUser = {
  id: number;
  name: string;
};

export type DbMembership = {
  accountId: number;
  ucid: string;
  name: string;
  role: 'owner' | 'moderator';
  subscriptionPlan: string;
  subscription: AccountSubscriptionSnapshot;
};

export type DbAccountMember = {
  userId: number;
  name: string;
  role: 'owner' | 'moderator';
  isActive: boolean;
  hasInviteLink: boolean;
  createdAt: string;
};

export type BonusBuyArchivedFilter = 'false' | 'true' | 'all';

export type BonusBuyStatus = 'live' | 'off_air' | 'archived';

export type BonusBuySlotStatus = 'pending' | 'playing' | 'archived';

export type BonusBuyWidgetPresetSource = 'system' | 'user';

export type DbBonusBuy = {
  id: number;
  accountId: number;
  name: string;
  startBalance: string;
  currencyCode: string;
  status: BonusBuyStatus;
  createdAt: Date;
  createdByUserId: number;
  createdByName: string;
};

export type PrizeSpinArchivedFilter = 'false' | 'true' | 'all';

export type PrizeSpinStatus = 'live' | 'off_air' | 'archived';

export type DbPrizeSpin = {
  id: number;
  accountId: number;
  title: string;
  status: PrizeSpinStatus;
  createdAt: Date;
  createdByUserId: number;
  createdByName: string;
};

export type DbPrizeSpinSector = {
  id: number;
  prizeSpinId: number;
  label: string;
  winPercent: string;
  color: string | null;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
};

export type DbPrizeSpinWin = {
  id: number;
  prizeSpinId: number;
  sectorId: number;
  sectorLabel: string;
  /** Viewer nick copied from chat into the dashboard field before spin. */
  participantNick: string;
  spunByUserId: number;
  spunByName: string;
  isArchived: boolean;
  createdAt: Date;
};

export type DbPrizeSpinWidget = {
  id: number;
  accountId: number;
  width: number;
  height: number;
  equalSectorSlices: boolean;
  showSectorWeightInWinner: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PatchPrizeSpinWidgetInput = {
  width?: number;
  height?: number;
  equalSectorSlices?: boolean;
  showSectorWeightInWinner?: boolean;
};

export type PatchPrizeSpinSectorInput = {
  label?: string;
  winPercent?: string;
  color?: string | null;
};

export type PatchPrizeSpinInput = {
  title?: string;
};

export type ChatRollStatus = 'live' | 'off_air' | 'archived';

export type ChatRollArchivedFilter = 'false' | 'true' | 'all';

export type ChatRollWinResponseStatus =
  | 'pending'
  | 'confirmed'
  | 'no_response'
  | 'not_required';

export type DbChatRoll = {
  id: number;
  accountId: number;
  title: string;
  status: ChatRollStatus;
  keyword: string;
  widgetKeywordPrefix: string;
  combineMode: 'highest' | 'sum';
  excludeWinnerAfterRoll: boolean;
  isAcceptingParticipants: boolean;
  replyInChat: boolean;
  winnerResponseEnabled: boolean;
  winnerResponseSeconds: number;
  showWinnerResponseInReveal: boolean;
  roleSettings: ChatRollRoleSettings;
  createdAt: Date;
  createdByUserId: number;
  createdByName: string;
};

export type DbChatRollParticipant = {
  id: number;
  chatRollId: number;
  provider: 'kick' | 'twitch' | 'youtube' | null;
  providerUserId: string | null;
  displayName: string;
  roleIds: string[];
  isArchived: boolean;
  excludedFromRollPool: boolean;
  isEligibleForRoll: boolean;
  joinedAt: Date;
};

export type DbChatRollWin = {
  id: number;
  chatRollId: number;
  participantId: number;
  displayName: string;
  coefficientAtPick: string;
  rolledByUserId: number;
  rolledByName: string;
  rollIndex: number;
  isArchived: boolean;
  responseStatus: ChatRollWinResponseStatus;
  responseDeadlineAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
  winnerResponseMessage: string | null;
};

export type DbChatRollWidget = {
  id: number;
  accountId: number;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PatchChatRollInput = {
  title?: string;
  keyword?: string;
  widgetKeywordPrefix?: string;
  combineMode?: 'highest' | 'sum';
  excludeWinnerAfterRoll?: boolean;
  isAcceptingParticipants?: boolean;
  replyInChat?: boolean;
  winnerResponseEnabled?: boolean;
  winnerResponseSeconds?: number;
  showWinnerResponseInReveal?: boolean;
  roleSettings?: ChatRollRoleSettings;
};

export type PatchChatRollWidgetInput = {
  width?: number;
  height?: number;
};

export type DbBonusBuySlot = {
  id: number;
  bonusBuyId: number;
  createdByUserId: number;
  createdByName: string;
  name: string;
  providerName: string | null;
  purchaseAmount: string;
  winAmount: string | null;
  multiplier: string | null;
  status: BonusBuySlotStatus;
  sortOrder: number;
  createdAt: Date;
};

export type PatchBonusBuySlotInput = {
  name?: string;
  providerName?: string | null;
  purchaseAmount?: string;
  winAmount?: string | null;
  status?: BonusBuySlotStatus;
};

export type DbBonusBuyWidget = {
  id: number;
  accountId: number;
  width: number;
  height: number;
  styleSettings: BonusBuyWidgetStyleSettings;
  presetId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicBonusBuyWidgetViewResult =
  | { kind: 'not_found' }
  | { kind: 'unavailable'; reason: 'no_live_session' | 'no_sessions' }
  | {
      kind: 'active';
      record: DbPublicBonusBuyRecord;
      slots: DbBonusBuySlot[];
      settings: DbBonusBuyWidget;
    };

export type PublicPrizeSpinWidgetViewResult =
  | { kind: 'not_found' }
  | { kind: 'unavailable'; reason: 'no_live_session' | 'no_sessions' }
  | {
      kind: 'active';
      record: DbPrizeSpin;
      sectors: DbPrizeSpinSector[];
      latestWin: DbPrizeSpinWin | null;
      settings: DbPrizeSpinWidget;
    };

export type PublicChatRollWidgetViewResult =
  | { kind: 'not_found' }
  | { kind: 'unavailable'; reason: 'no_live_session' | 'no_sessions' }
  | {
      kind: 'active';
      record: Pick<
        DbChatRoll,
        'id' | 'keyword' | 'widgetKeywordPrefix' | 'status'
      >;
    };

export type DbBonusBuyWidgetStylePreset = {
  id: number;
  accountId: number | null;
  createdByUserId: number | null;
  source: BonusBuyWidgetPresetSource;
  name: string;
  styleSettings: BonusBuyWidgetStyleSettings;
  createdAt: Date;
  updatedAt: Date;
};

export type PatchBonusBuyWidgetInput = {
  width?: number;
  height?: number;
  presetId?: number | null;
};

export type UpsertBonusBuyWidgetCustomPresetInput = {
  styleSettings: BonusBuyWidgetStyleSettings;
};

export type DbPublicBonusBuyRecord = {
  id: number;
  name: string;
  startBalance: string;
  currencyCode: string;
  status: BonusBuyStatus;
};

const WIDGET_MIN_DIMENSION = 200;
const WIDGET_MAX_DIMENSION = 2400;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function toInt(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseInt(value, 10);
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  async onModuleInit(): Promise<void> {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5433/caz_agent';

    this.pool = new Pool({ connectionString });
    await runMigrations(this.pool);
    await this.seedBonusBuySystemPresets();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  private async seedBonusBuySystemPresets(): Promise<void> {
    const existing = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM bonus_buy_widget_style_preset
        WHERE source = 'system'
      `,
    );
    if (Number(existing.rows[0]?.count ?? 0) > 0) {
      return;
    }

    for (const preset of BONUS_BUY_SYSTEM_PRESET_SEEDS) {
      await this.pool.query(
        `
          INSERT INTO bonus_buy_widget_style_preset (source, name, style_settings)
          VALUES ('system', $1, $2::jsonb)
        `,
        [preset.name, JSON.stringify(preset.styleSettings)],
      );
    }
  }

  async findUserById(userId: number): Promise<DbUser | null> {
    const result = await this.pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM users WHERE id = $1`,
      [userId],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return { id: toInt(row.id), name: row.name };
  }

  async hasActiveCredentials(userId: number): Promise<boolean> {
    const result = await this.pool.query<{ ok: number }>(
      `
        SELECT 1 AS ok
        FROM auth_credentials
        WHERE user_id = $1 AND is_active = true
        LIMIT 1
      `,
      [userId],
    );
    return Boolean(result.rows[0]);
  }

  async findCredentialByProvider(
    provider: string,
    providerUserId: string,
  ): Promise<{ userId: number; isActive: boolean } | null> {
    const result = await this.pool.query<{
      user_id: number;
      is_active: boolean;
    }>(
      `
        SELECT user_id, is_active
        FROM auth_credentials
        WHERE provider = $1 AND provider_user_id = $2
      `,
      [provider, providerUserId],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return { userId: toInt(row.user_id), isActive: row.is_active };
  }

  private mapAccountSubscriptionRow(row: {
    status: AccountSubscriptionRow['status'] | null;
    plan_tier: string | null;
    starts_at: Date | null;
    ends_at: Date | null;
  }): AccountSubscriptionRow | null {
    if (
      row.status === null ||
      row.plan_tier === null ||
      row.starts_at === null ||
      row.ends_at === null
    ) {
      return null;
    }

    return {
      status: row.status,
      planTier: row.plan_tier,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
    };
  }

  async expireAccountSubscriptionIfNeeded(accountId: number): Promise<void> {
    await this.pool.query(
      `
        UPDATE account_subscriptions
        SET status = 'expired', updated_at = now()
        WHERE account_id = $1
          AND status = 'active'
          AND ends_at <= now()
      `,
      [accountId],
    );
  }

  async loadAccountSubscriptionSnapshot(
    accountId: number,
  ): Promise<AccountSubscriptionSnapshot> {
    const result = await this.pool.query<{
      status: AccountSubscriptionRow['status'] | null;
      plan_tier: string | null;
      starts_at: Date | null;
      ends_at: Date | null;
    }>(
      `
        SELECT status, plan_tier, starts_at, ends_at
        FROM account_subscriptions
        WHERE account_id = $1
        LIMIT 1
      `,
      [accountId],
    );

    const subscriptionRow = this.mapAccountSubscriptionRow(
      result.rows[0] ?? {
        status: null,
        plan_tier: null,
        starts_at: null,
        ends_at: null,
      },
    );

    if (subscriptionRow && shouldMarkSubscriptionExpired(subscriptionRow)) {
      await this.expireAccountSubscriptionIfNeeded(accountId);
      subscriptionRow.status = 'expired';
    }

    return resolveAccountSubscriptionAccess(subscriptionRow);
  }

  async insertTrialSubscriptionForAccount(
    accountId: number,
    client: { query: Pool['query'] },
  ): Promise<void> {
    await client.query(
      `
        INSERT INTO account_subscriptions (
          account_id, status, plan_tier, starts_at, ends_at
        )
        VALUES (
          $1, 'active', 'trial', now(),
          now() + make_interval(days => $2::int)
        )
      `,
      [accountId, TRIAL_DURATION_DAYS],
    );
  }

  async accountHasSubscriptionAccess(accountId: number): Promise<boolean> {
    const snapshot = await this.loadAccountSubscriptionSnapshot(accountId);
    return snapshot.hasAccess;
  }

  async loadEntitlementUsage(
    accountId: number,
    context: { bonusBuyId?: number; prizeSpinId?: number } = {},
  ): Promise<EntitlementUsage> {
    const counts = await this.pool.query<{
      bonus_buy: number;
      prize_spin: number;
      chat_roll: number;
    }>(
      `
        SELECT
          (
            SELECT COUNT(*)::int
            FROM bonus_buy
            WHERE account_id = $1 AND status != 'archived'
          ) AS bonus_buy,
          (
            SELECT COUNT(*)::int
            FROM prize_spin
            WHERE account_id = $1 AND status != 'archived'
          ) AS prize_spin,
          (
            SELECT COUNT(*)::int
            FROM chat_roll
            WHERE account_id = $1 AND status != 'archived'
          ) AS chat_roll
      `,
      [accountId],
    );
    const sessionRow = counts.rows[0] ?? {
      bonus_buy: 0,
      prize_spin: 0,
      chat_roll: 0,
    };

    let bonusBuySlots: number | null = null;
    if (context.bonusBuyId !== undefined) {
      const slotResult = await this.pool.query<{ count: number }>(
        `
          SELECT COUNT(*)::int AS count
          FROM bonus_buy_slot
          WHERE bonus_buy_id = $1 AND status != 'archived'
        `,
        [context.bonusBuyId],
      );
      bonusBuySlots = slotResult.rows[0]?.count ?? 0;
    }

    let prizeSpinSectors: number | null = null;
    if (context.prizeSpinId !== undefined) {
      const sectorResult = await this.pool.query<{ count: number }>(
        `
          SELECT COUNT(*)::int AS count
          FROM prize_spin_sector
          WHERE prize_spin_id = $1
        `,
        [context.prizeSpinId],
      );
      prizeSpinSectors = sectorResult.rows[0]?.count ?? 0;
    }

    const moderatorResult = await this.pool.query<{ count: number }>(
      `
        SELECT COUNT(*)::int AS count
        FROM account_members
        WHERE account_id = $1
          AND role = 'moderator'
          AND is_active = true
      `,
      [accountId],
    );

    return {
      sessions: {
        bonusBuy: sessionRow.bonus_buy,
        prizeSpin: sessionRow.prize_spin,
        chatRoll: sessionRow.chat_roll,
      },
      bonusBuySlots,
      prizeSpinSectors,
      moderatorMembers: moderatorResult.rows[0]?.count ?? 0,
    };
  }

  async getPrimaryMembership(userId: number): Promise<DbMembership | null> {
    const result = await this.pool.query<{
      account_id: string | number;
      ucid: string;
      name: string;
      role: 'owner' | 'moderator';
      subscription_plan: string;
      status: AccountSubscriptionRow['status'] | null;
      plan_tier: string | null;
      starts_at: Date | null;
      ends_at: Date | null;
    }>(
      `
        SELECT
          a.id AS account_id,
          a.ucid,
          a.name,
          am.role,
          a.subscription_plan,
          s.status,
          s.plan_tier,
          s.starts_at,
          s.ends_at
        FROM account_members am
        JOIN accounts a ON a.id = am.account_id
        LEFT JOIN account_subscriptions s ON s.account_id = a.id
        WHERE am.user_id = $1 AND am.is_active = true
        ORDER BY CASE WHEN am.role = 'owner' THEN 0 ELSE 1 END, a.name
        LIMIT 1
      `,
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const accountId = toInt(row.account_id);
    const subscriptionRow = this.mapAccountSubscriptionRow(row);
    if (subscriptionRow && shouldMarkSubscriptionExpired(subscriptionRow)) {
      await this.expireAccountSubscriptionIfNeeded(accountId);
      subscriptionRow.status = 'expired';
    }
    const subscription = resolveAccountSubscriptionAccess(subscriptionRow);

    return {
      accountId,
      ucid: row.ucid,
      name: row.name,
      role: row.role,
      subscriptionPlan: row.subscription_plan,
      subscription,
    };
  }

  async getAccountUcid(accountId: number): Promise<string | null> {
    const result = await this.pool.query<{ ucid: string }>(
      `SELECT ucid FROM accounts WHERE id = $1 LIMIT 1`,
      [accountId],
    );

    return result.rows[0]?.ucid ?? null;
  }

  async provisionOwnerFromKick(profile: KickProfile): Promise<{
    userId: number;
    membership: DbMembership;
  }> {
    const existing = await this.findCredentialByProvider('kick', profile.providerUserId);
    if (existing) {
      const user = await this.findUserById(existing.userId);
      const membership = await this.getPrimaryMembership(existing.userId);
      if (!user || !membership) {
        throw new Error('OWNER_STATE_CORRUPT');
      }
      return { userId: user.id, membership };
    }

    const accountName = profile.username.trim();
    if (accountName.length < 2 || accountName.length > 100) {
      throw new Error('INVALID_KICK_USERNAME');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<{ id: number }>(
        `INSERT INTO users (name) VALUES ($1) RETURNING id`,
        [accountName],
      );
      const userId = toInt(userResult.rows[0].id);

      await client.query(
        `
          INSERT INTO auth_credentials (user_id, provider, provider_user_id, provider_username)
          VALUES ($1, 'kick', $2, $3)
        `,
        [userId, profile.providerUserId, profile.username],
      );

      const accountResult = await client.query<{ id: number; ucid: string }>(
        `
          INSERT INTO accounts (name, subscription_plan)
          VALUES ($1, 'free')
          RETURNING id, ucid
        `,
        [accountName],
      );

      const accountId = toInt(accountResult.rows[0].id);
      const accountUcid = accountResult.rows[0].ucid;

      await this.insertTrialSubscriptionForAccount(accountId, client);

      await client.query(
        `
          INSERT INTO account_members (account_id, user_id, role, is_active)
          VALUES ($1, $2, 'owner', true)
        `,
        [accountId, userId],
      );

      await client.query(
        `
          INSERT INTO account_channels (account_id, provider, channel_id, channel_slug, is_primary)
          VALUES ($1, 'kick', $2, $3, true)
        `,
        [accountId, profile.channelId, profile.channelSlug],
      );

      await client.query(
        PRIZE_SPIN_WIDGET_INSERT_SQL,
        prizeSpinWidgetInsertParams(accountId),
      );

      await client.query(
        CHAT_ROLL_WIDGET_INSERT_SQL,
        chatRollWidgetInsertParams(accountId),
      );

      const bootstrapPreset = await this.resolveBootstrapWidgetPreset(
        client,
        accountId,
      );
      await client.query(
        BONUS_BUY_WIDGET_INSERT_SQL,
        bonusBuyWidgetInsertParams(accountId, bootstrapPreset.presetId),
      );

      await client.query('COMMIT');

      const subscription = await this.loadAccountSubscriptionSnapshot(accountId);

      return {
        userId,
        membership: {
          accountId,
          ucid: accountUcid,
          name: accountName,
          role: 'owner',
          subscriptionPlan: 'free',
          subscription,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAccessLinkUserIdByToken(token: string): Promise<number | null> {
    const result = await this.pool.query<{
      user_id: number;
      token_hash: string;
      is_active: boolean;
    }>(
      `
        SELECT user_id, token_hash, is_active
        FROM auth_credentials
        WHERE provider = 'access_link' AND is_active = true
      `,
    );

    for (const row of result.rows) {
      const matches = await verifyAccessToken(token, row.token_hash);
      if (matches) {
        return toInt(row.user_id);
      }
    }

    return null;
  }

  async isAccountOwner(accountId: number, userId: number): Promise<boolean> {
    const result = await this.pool.query<{ ok: number }>(
      `
        SELECT 1 AS ok
        FROM account_members
        WHERE account_id = $1 AND user_id = $2 AND role = 'owner' AND is_active = true
      `,
      [accountId, userId],
    );
    return Boolean(result.rows[0]);
  }

  async hasActiveMembership(accountId: number, userId: number): Promise<boolean> {
    const result = await this.pool.query<{ ok: number }>(
      `
        SELECT 1 AS ok
        FROM account_members
        WHERE account_id = $1 AND user_id = $2 AND is_active = true
      `,
      [accountId, userId],
    );
    return Boolean(result.rows[0]);
  }

  async getPrimaryKickChannel(
    accountId: number,
  ): Promise<{ channelId: string; channelSlug: string } | null> {
    const result = await this.pool.query<{
      channel_id: string;
      channel_slug: string;
    }>(
      `
        SELECT channel_id, channel_slug
        FROM account_channels
        WHERE account_id = $1 AND provider = 'kick' AND is_primary = true
        LIMIT 1
      `,
      [accountId],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return { channelId: row.channel_id, channelSlug: row.channel_slug };
  }

  async listAccountMembers(
    accountId: number,
    input: {
      role?: 'all' | 'owner' | 'moderator';
      status?: 'true' | 'false' | 'all';
      page?: number;
      limit?: number;
      sortBy?: 'name' | 'role' | 'status' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<{
    members: DbAccountMember[];
    total: number;
    page: number;
    limit: number;
  }> {
    const roleFilter = input.role ?? 'all';
    const statusFilter = input.status ?? 'true';
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const sortBy = input.sortBy ?? 'role';
    const sortOrder = input.sortOrder ?? 'asc';
    const offset = (page - 1) * limit;

    const sortColumns = {
      name: 'u.name',
      role: 'am.role',
      status: 'am.is_active',
      createdAt: 'am.created_at',
    } as const;
    const sortColumn = sortColumns[sortBy] ?? sortColumns.role;
    const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const filters: string[] = ['am.account_id = $1'];
    const filterParams: (number | string | boolean)[] = [accountId];

    if (roleFilter !== 'all') {
      filterParams.push(roleFilter);
      filters.push(`am.role = $${filterParams.length}`);
    }

    if (statusFilter === 'true') {
      filters.push('am.is_active = true');
    } else if (statusFilter === 'false') {
      filters.push('am.is_active = false');
    }

    const whereClause = filters.join(' AND ');

    const countResult = await this.pool.query<{ count: string | number }>(
      `
        SELECT COUNT(*)::text AS count
        FROM account_members am
        JOIN users u ON u.id = am.user_id
        WHERE ${whereClause}
      `,
      filterParams,
    );
    const total = toInt(countResult.rows[0]?.count ?? 0);

    const listParams = [...filterParams, limit, offset];
    const result = await this.pool.query<{
      user_id: string | number;
      name: string;
      role: 'owner' | 'moderator';
      is_active: boolean;
      has_invite_link: boolean;
      created_at: Date;
    }>(
      `
        SELECT
          u.id AS user_id,
          u.name,
          am.role,
          am.is_active,
          am.created_at,
          EXISTS (
            SELECT 1
            FROM auth_credentials ac
            WHERE ac.user_id = u.id
              AND ac.provider = 'access_link'
              AND ac.is_active = true
          ) AS has_invite_link
        FROM account_members am
        JOIN users u ON u.id = am.user_id
        WHERE ${whereClause}
        ORDER BY ${sortColumn} ${sortDirection}, u.name ASC
        LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
      `,
      listParams,
    );

    return {
      members: result.rows.map((row) => ({
        userId: toInt(row.user_id),
        name: row.name,
        role: row.role,
        isActive: row.is_active,
        hasInviteLink: row.has_invite_link,
        createdAt: row.created_at.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async rotateModeratorInviteLink(
    accountId: number,
    ownerUserId: number,
    moderatorUserId: number,
    appBaseUrl: string,
  ): Promise<{ joinUrl: string }> {
    const isOwner = await this.isAccountOwner(accountId, ownerUserId);
    if (!isOwner) {
      throw new Error('FORBIDDEN');
    }

    const target = await this.pool.query<{
      role: 'owner' | 'moderator';
      is_active: boolean;
    }>(
      `
        SELECT role, is_active
        FROM account_members
        WHERE account_id = $1 AND user_id = $2
      `,
      [accountId, moderatorUserId],
    );

    if (
      !target.rows[0] ||
      target.rows[0].role !== 'moderator' ||
      !target.rows[0].is_active
    ) {
      throw new Error('MODERATOR_NOT_FOUND');
    }

    const plainToken = generateAccessToken();
    const tokenHash = await hashAccessToken(plainToken);

    const result = await this.pool.query(
      `
        UPDATE auth_credentials
        SET token_hash = $1, updated_at = now()
        WHERE user_id = $2
          AND provider = 'access_link'
          AND is_active = true
      `,
      [tokenHash, moderatorUserId],
    );

    if (result.rowCount === 0) {
      throw new Error('INVITE_LINK_NOT_FOUND');
    }

    const joinUrl = `${appBaseUrl.replace(/\/$/, '')}/join/${plainToken}`;
    return { joinUrl };
  }

  async createModeratorWithAccessLink(
    accountId: number,
    ownerUserId: number,
    name: string,
    appBaseUrl: string,
  ): Promise<{ userId: number; name: string; joinUrl: string }> {
    const isOwner = await this.isAccountOwner(accountId, ownerUserId);
    if (!isOwner) {
      throw new Error('FORBIDDEN');
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      throw new Error('INVALID_MODERATOR_NAME');
    }

    const plainToken = generateAccessToken();
    const tokenHash = await hashAccessToken(plainToken);
    const linkProviderUserId = providerUserIdForAccessLink();

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<{ id: number }>(
        `INSERT INTO users (name) VALUES ($1) RETURNING id`,
        [trimmed],
      );
      const userId = toInt(userResult.rows[0].id);

      await client.query(
        `
          INSERT INTO auth_credentials (
            user_id, provider, provider_user_id, token_hash
          )
          VALUES ($1, 'access_link', $2, $3)
        `,
        [userId, linkProviderUserId, tokenHash],
      );

      await client.query(
        `
          INSERT INTO account_members (account_id, user_id, role, is_active)
          VALUES ($1, $2, 'moderator', true)
        `,
        [accountId, userId],
      );

      await client.query('COMMIT');

      const joinUrl = `${appBaseUrl.replace(/\/$/, '')}/join/${plainToken}`;
      return { userId, name: trimmed, joinUrl };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapBonusBuyRow(row: {
    id: string | number;
    account_id: string | number;
    name: string;
    start_balance: string;
    currency_code: string;
    status: string;
    created_at: Date;
    created_by_user_id: string | number;
    created_by_name: string;
  }): DbBonusBuy {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      name: row.name,
      startBalance: row.start_balance,
      currencyCode: (row.currency_code ?? 'USD').trim().toUpperCase(),
      status: row.status as BonusBuyStatus,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    };
  }

  private bonusBuyArchivedClause(archived: BonusBuyArchivedFilter): string {
    if (archived === 'all') {
      return '';
    }
    return archived === 'true'
      ? "AND bb.status = 'archived'"
      : "AND bb.status IN ('live', 'off_air')";
  }

  private async requireMutableBonusBuy(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuy> {
    const session = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }
    if (session.status === 'archived') {
      throw new Error('NOT_FOUND');
    }
    return session;
  }

  async getBonusBuyById(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuy | null> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      name: string;
      start_balance: string;
      currency_code: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          bb.id,
          bb.account_id,
          bb.name,
          bb.start_balance::text AS start_balance,
          bb.currency_code,
          bb.status,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
        FROM bonus_buy bb
        JOIN users u ON u.id = bb.created_by_user_id
        WHERE bb.account_id = $1 AND bb.id = $2
      `,
      [accountId, bonusBuyId],
    );

    const row = result.rows[0];
    return row ? this.mapBonusBuyRow(row) : null;
  }

  async listBonusBuys(
    accountId: number,
    archived: BonusBuyArchivedFilter = 'false',
    page = 1,
    limit = 10,
  ): Promise<{
    records: DbBonusBuy[];
    total: number;
    page: number;
    limit: number;
  }> {
    const statusClause = this.bonusBuyArchivedClause(archived);
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query<{ count: string | number }>(
      `
        SELECT COUNT(*)::text AS count
        FROM bonus_buy bb
        WHERE bb.account_id = $1
          ${statusClause}
      `,
      [accountId],
    );

    const total = toInt(countResult.rows[0]?.count ?? 0);

    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      name: string;
      start_balance: string;
      currency_code: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          bb.id,
          bb.account_id,
          bb.name,
          bb.start_balance::text AS start_balance,
          bb.currency_code,
          bb.status,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
        FROM bonus_buy bb
        JOIN users u ON u.id = bb.created_by_user_id
        WHERE bb.account_id = $1
          ${statusClause}
        ORDER BY bb.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [accountId, limit, offset],
    );

    return {
      records: result.rows.map((row) => this.mapBonusBuyRow(row)),
      total,
      page,
      limit,
    };
  }

  private async resolveDefaultSystemWidgetPresetId(
    client: { query: Pool['query'] },
  ): Promise<number> {
    const systemPreset = await client.query<{ id: string | number }>(
      `
        SELECT id
        FROM bonus_buy_widget_style_preset
        WHERE source = 'system'
        ORDER BY id ASC
        LIMIT 1
      `,
    );

    const systemRow = systemPreset.rows[0];
    if (!systemRow) {
      throw new Error('SYSTEM_PRESET_NOT_FOUND');
    }

    return toInt(systemRow.id);
  }

  private async resolveBootstrapWidgetPreset(
    client: { query: Pool['query'] },
    accountId: number,
  ): Promise<{ presetId: number }> {
    const userPreset = await client.query<{
      id: string | number;
    }>(
      `
        SELECT id
        FROM bonus_buy_widget_style_preset
        WHERE account_id = $1
          AND source = 'user'
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [accountId],
    );

    const userRow = userPreset.rows[0];
    if (userRow) {
      return {
        presetId: toInt(userRow.id),
      };
    }

    return {
      presetId: await this.resolveDefaultSystemWidgetPresetId(client),
    };
  }

  async createBonusBuy(
    accountId: number,
    createdByUserId: number,
    name: string,
    startBalance: string,
    currencyCode: string,
  ): Promise<DbBonusBuy> {
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 200) {
      throw new Error('INVALID_NAME');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(startBalance)) {
      throw new Error('INVALID_START_BALANCE');
    }

    const balanceValue = Number.parseFloat(startBalance);
    if (!Number.isFinite(balanceValue) || balanceValue < 0) {
      throw new Error('INVALID_START_BALANCE');
    }

    const normalizedBalance = balanceValue.toFixed(2);
    const normalizedCurrency = normalizeCurrencyCode(currencyCode);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM bonus_buy
            WHERE account_id = $1
              AND status = 'live'
          ) AS has_live
        `,
        [accountId],
      );
      const initialStatus = initialSessionStatusOnCreate(
        liveCheck.rows[0]?.has_live ?? false,
      );

      const result = await client.query<{
        id: string | number;
        account_id: string | number;
        name: string;
        start_balance: string;
        currency_code: string;
        status: string;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          INSERT INTO bonus_buy (
            account_id, created_by_user_id, name, start_balance, currency_code, status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING
            id,
            account_id,
            name,
            start_balance::text AS start_balance,
            currency_code,
            status,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [
          accountId,
          createdByUserId,
          trimmedName,
          normalizedBalance,
          normalizedCurrency,
          initialStatus,
        ],
      );

      await client.query('COMMIT');

      const row = result.rows[0];

      return this.mapBonusBuyRow(row);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async endBonusBuy(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuy> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      name: string;
      start_balance: string;
      currency_code: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        UPDATE bonus_buy bb
        SET status = 'archived'
        FROM users u
        WHERE bb.created_by_user_id = u.id
          AND bb.account_id = $1
          AND bb.id = $2
          AND bb.status IN ('live', 'off_air')
        RETURNING
          bb.id,
          bb.account_id,
          bb.name,
          bb.start_balance::text AS start_balance,
          bb.currency_code,
          bb.status,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
      `,
      [accountId, bonusBuyId],
    );

    const row = result.rows[0];
    if (row) {
      return this.mapBonusBuyRow(row);
    }

    const existing = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (existing.status === 'archived') {
      throw new Error('ALREADY_ENDED');
    }

    throw new Error('NOT_FOUND');
  }

  async goLiveBonusBuy(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuy> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const targetResult = await client.query<{ status: string }>(
        `
          SELECT status
          FROM bonus_buy
          WHERE account_id = $1
            AND id = $2
          LIMIT 1
        `,
        [accountId, bonusBuyId],
      );
      const target = targetResult.rows[0];
      if (!target || target.status === 'archived') {
        throw new Error('NOT_FOUND');
      }

      if (target.status === 'live') {
        await client.query('COMMIT');
        const row = await this.getBonusBuyById(accountId, bonusBuyId);
        if (!row) {
          throw new Error('NOT_FOUND');
        }
        return row;
      }

      await client.query(
        `
          UPDATE bonus_buy
          SET status = 'off_air'
          WHERE account_id = $1
            AND status = 'live'
        `,
        [accountId],
      );

      const promoteResult = await client.query<{
        id: string | number;
        account_id: string | number;
        name: string;
        start_balance: string;
        currency_code: string;
        status: string;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          UPDATE bonus_buy bb
          SET status = 'live'
          FROM users u
          WHERE bb.created_by_user_id = u.id
            AND bb.account_id = $1
            AND bb.id = $2
            AND bb.status = 'off_air'
          RETURNING
            bb.id,
            bb.account_id,
            bb.name,
            bb.start_balance::text AS start_balance,
            bb.currency_code,
            bb.status,
            bb.created_at,
            bb.created_by_user_id,
            u.name AS created_by_name
        `,
        [accountId, bonusBuyId],
      );

      if (promoteResult.rowCount === 0) {
        throw new Error('NOT_FOUND');
      }

      await client.query('COMMIT');
      return this.mapBonusBuyRow(promoteResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateBonusBuy(
    accountId: number,
    bonusBuyId: number,
    updates: {
      name?: string;
      startBalance?: string;
      currencyCode?: string;
    },
  ): Promise<DbBonusBuy> {
    const existing = await this.requireMutableBonusBuy(accountId, bonusBuyId);

    const nextName =
      updates.name !== undefined ? updates.name.trim() : existing.name;
    if (nextName.length === 0 || nextName.length > 200) {
      throw new Error('INVALID_NAME');
    }

    const nextBalance =
      updates.startBalance !== undefined
        ? normalizeMoney(updates.startBalance)
        : existing.startBalance;

    const nextCurrency =
      updates.currencyCode !== undefined
        ? normalizeCurrencyCode(updates.currencyCode)
        : existing.currencyCode;

    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      name: string;
      start_balance: string;
      currency_code: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        UPDATE bonus_buy bb
        SET name = $3, start_balance = $4, currency_code = $5
        FROM users u
        WHERE bb.created_by_user_id = u.id
          AND bb.account_id = $1
          AND bb.id = $2
        RETURNING
          bb.id,
          bb.account_id,
          bb.name,
          bb.start_balance::text AS start_balance,
          bb.currency_code,
          bb.status,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
      `,
      [accountId, bonusBuyId, nextName, nextBalance, nextCurrency],
    );

    return this.mapBonusBuyRow(result.rows[0]);
  }

  private mapBonusBuySlotRow(row: {
    id: string | number;
    bonus_buy_id: string | number;
    created_by_user_id: string | number;
    created_by_name: string;
    name: string;
    provider_name: string | null;
    purchase_amount: string;
    win_amount: string | null;
    multiplier: string | null;
    status: string;
    sort_order: string | number;
    created_at: Date;
  }): DbBonusBuySlot {
    return {
      id: toInt(row.id),
      bonusBuyId: toInt(row.bonus_buy_id),
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
      name: row.name,
      providerName: row.provider_name,
      purchaseAmount: row.purchase_amount,
      winAmount: row.win_amount,
      multiplier: row.multiplier,
      status: row.status as BonusBuySlotStatus,
      sortOrder: toInt(row.sort_order),
      createdAt: row.created_at,
    };
  }

  private async compactBonusBuySlotSortOrders(
    client: PoolClient,
    bonusBuyId: number,
  ): Promise<void> {
    await client.query(
      `
        WITH ranked AS (
          SELECT
            id,
            ROW_NUMBER() OVER (ORDER BY sort_order ASC, id ASC) AS new_order
          FROM bonus_buy_slot
          WHERE bonus_buy_id = $1
            AND status != 'archived'
        )
        UPDATE bonus_buy_slot s
        SET sort_order = r.new_order
        FROM ranked r
        WHERE s.id = r.id
      `,
      [bonusBuyId],
    );
  }

  async listBonusBuySlots(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuySlot[]> {
    const session = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    const result = await this.pool.query<{
      id: string | number;
      bonus_buy_id: string | number;
      created_by_user_id: string | number;
      created_by_name: string;
      name: string;
      provider_name: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      status: string;
      sort_order: string | number;
      created_at: Date;
    }>(
      `
        SELECT
          s.id,
          s.bonus_buy_id,
          s.created_by_user_id,
          u.name AS created_by_name,
          s.name,
          s.provider_name,
          s.purchase_amount::text AS purchase_amount,
          s.win_amount::text AS win_amount,
          s.multiplier::text AS multiplier,
          s.status,
          s.sort_order,
          s.created_at
        FROM bonus_buy_slot s
        JOIN users u ON u.id = s.created_by_user_id
        WHERE s.bonus_buy_id = $1
          AND s.status != 'archived'
        ORDER BY s.sort_order ASC, s.id ASC
      `,
      [bonusBuyId],
    );

    return result.rows.map((row) => this.mapBonusBuySlotRow(row));
  }

  async createBonusBuySlot(
    accountId: number,
    bonusBuyId: number,
    createdByUserId: number,
    name: string,
    providerName: string | null,
    purchaseAmount: string,
  ): Promise<DbBonusBuySlot> {
    await this.requireMutableBonusBuy(accountId, bonusBuyId);

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 200) {
      throw new Error('INVALID_SLOT_NAME');
    }

    const normalizedPurchase = normalizePositiveMoney(purchaseAmount);
    const trimmedProvider = providerName?.trim() ?? '';
    const providerValue = trimmedProvider.length > 0 ? trimmedProvider : null;

    const result = await this.pool.query<{
      id: string | number;
      bonus_buy_id: string | number;
      created_by_user_id: string | number;
      created_by_name: string;
      name: string;
      provider_name: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      status: string;
      sort_order: string | number;
      created_at: Date;
    }>(
      `
        INSERT INTO bonus_buy_slot (
          bonus_buy_id,
          created_by_user_id,
          name,
          provider_name,
          purchase_amount,
          sort_order
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          COALESCE(
            (
              SELECT MAX(sort_order)
              FROM bonus_buy_slot
              WHERE bonus_buy_id = $1
                AND status != 'archived'
            ),
            0
          ) + 1
        )
        RETURNING
          id,
          bonus_buy_id,
          created_by_user_id,
          (SELECT name FROM users WHERE id = $2) AS created_by_name,
          name,
          provider_name,
          purchase_amount::text AS purchase_amount,
          win_amount::text AS win_amount,
          multiplier::text AS multiplier,
          status,
          sort_order,
          created_at
      `,
      [bonusBuyId, createdByUserId, trimmedName, providerValue, normalizedPurchase],
    );

    return this.mapBonusBuySlotRow(result.rows[0]);
  }

  async patchBonusBuySlot(
    accountId: number,
    bonusBuyId: number,
    slotId: number,
    input: PatchBonusBuySlotInput,
  ): Promise<DbBonusBuySlot> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query<{
        id: string | number;
        bonus_buy_id: string | number;
        name: string;
        provider_name: string | null;
        purchase_amount: string;
        win_amount: string | null;
        multiplier: string | null;
        status: string;
      }>(
        `
          SELECT
            s.id,
            s.bonus_buy_id,
            s.name,
            s.provider_name,
            s.purchase_amount::text AS purchase_amount,
            s.win_amount::text AS win_amount,
            s.multiplier::text AS multiplier,
            s.status
          FROM bonus_buy_slot s
          JOIN bonus_buy bb ON bb.id = s.bonus_buy_id
          WHERE bb.account_id = $1
            AND s.bonus_buy_id = $2
            AND s.id = $3
            AND bb.status != 'archived'
        `,
        [accountId, bonusBuyId, slotId],
      );

      const row = existing.rows[0];
      if (!row || row.status === 'archived') {
        throw new Error('NOT_FOUND');
      }

      let nextName = row.name;
      if (input.name !== undefined) {
        const trimmed = input.name.trim();
        if (trimmed.length === 0 || trimmed.length > 200) {
          throw new Error('INVALID_SLOT_NAME');
        }
        nextName = trimmed;
      }

      let nextProvider = row.provider_name;
      if (input.providerName !== undefined) {
        if (input.providerName === null) {
          nextProvider = null;
        } else {
          const trimmed = input.providerName.trim();
          nextProvider = trimmed.length > 0 ? trimmed : null;
        }
      }

      let nextPurchase = row.purchase_amount;
      if (input.purchaseAmount !== undefined) {
        nextPurchase = normalizePositiveMoney(input.purchaseAmount);
      }

      let nextWin: string | null = row.win_amount;
      if (input.winAmount !== undefined) {
        nextWin =
          input.winAmount === null
            ? null
            : normalizeMoney(input.winAmount);
      }

      let nextMultiplier: string | null = row.multiplier;
      if (nextWin === null) {
        nextMultiplier = null;
      } else {
        nextMultiplier = computeMultiplier(nextWin, nextPurchase);
      }

      let nextStatus = row.status as BonusBuySlotStatus;
      if (input.status !== undefined) {
        if (
          input.status !== 'pending' &&
          input.status !== 'playing' &&
          input.status !== 'archived'
        ) {
          throw new Error('INVALID_SLOT_STATUS');
        }
        nextStatus = input.status;
      }

      if (nextStatus === 'playing') {
        await client.query(
          `
            UPDATE bonus_buy_slot
            SET status = 'pending'
            WHERE bonus_buy_id = $1
              AND id != $2
              AND status = 'playing'
          `,
          [bonusBuyId, slotId],
        );
      }

      const updated = await client.query<{
        id: string | number;
        bonus_buy_id: string | number;
        created_by_user_id: string | number;
        created_by_name: string;
        name: string;
        provider_name: string | null;
        purchase_amount: string;
        win_amount: string | null;
        multiplier: string | null;
        status: string;
        sort_order: string | number;
        created_at: Date;
      }>(
        `
          UPDATE bonus_buy_slot s
          SET
            name = $3,
            provider_name = $4,
            purchase_amount = $5,
            win_amount = $6,
            multiplier = $7,
            status = $8
          FROM users u
          WHERE s.created_by_user_id = u.id
            AND s.id = $1
            AND s.bonus_buy_id = $2
          RETURNING
            s.id,
            s.bonus_buy_id,
            s.created_by_user_id,
            u.name AS created_by_name,
            s.name,
            s.provider_name,
            s.purchase_amount::text AS purchase_amount,
            s.win_amount::text AS win_amount,
            s.multiplier::text AS multiplier,
            s.status,
            s.sort_order,
            s.created_at
        `,
        [
          slotId,
          bonusBuyId,
          nextName,
          nextProvider,
          nextPurchase,
          nextWin,
          nextMultiplier,
          nextStatus,
        ],
      );

      await client.query('COMMIT');
      return this.mapBonusBuySlotRow(updated.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private clampWidgetDimension(value: number): number {
    return Math.min(
      WIDGET_MAX_DIMENSION,
      Math.max(WIDGET_MIN_DIMENSION, Math.trunc(value)),
    );
  }

  private mapBonusBuyWidgetRow(row: {
    id: string | number;
    account_id: string | number;
    width: string | number;
    height: string | number;
    preset_id: string | number;
    preset_style_settings: BonusBuyWidgetStyleSettings | null;
    created_at: Date;
    updated_at: Date;
  }): DbBonusBuyWidget {
    const styleSettings = row.preset_style_settings
      ? parseBonusBuyWidgetStyleSettings(row.preset_style_settings)
      : BONUS_BUY_WIDGET_STYLE_DEFAULTS;

    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      width: toInt(row.width),
      height: toInt(row.height),
      styleSettings,
      presetId: toInt(row.preset_id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapBonusBuyWidgetPresetRow(row: {
    id: string | number;
    account_id: string | number | null;
    created_by_user_id: string | number | null;
    source: string;
    name: string;
    style_settings: BonusBuyWidgetStyleSettings;
    created_at: Date;
    updated_at: Date;
  }): DbBonusBuyWidgetStylePreset {
    return {
      id: toInt(row.id),
      accountId: row.account_id === null ? null : toInt(row.account_id),
      createdByUserId:
        row.created_by_user_id === null ? null : toInt(row.created_by_user_id),
      source: row.source as BonusBuyWidgetPresetSource,
      name: row.name,
      styleSettings: parseBonusBuyWidgetStyleSettings(row.style_settings),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private widgetSelectColumns(alias = 'w', presetAlias = 'p'): string {
    return `
      ${alias}.id,
      ${alias}.account_id,
      ${alias}.width,
      ${alias}.height,
      ${alias}.preset_id,
      ${alias}.created_at,
      ${alias}.updated_at,
      ${presetAlias}.style_settings AS preset_style_settings
    `;
  }

  private widgetFromJoin(widgetAlias = 'w', presetAlias = 'p'): string {
    return `
      FROM bonus_buy_widget ${widgetAlias}
      LEFT JOIN bonus_buy_widget_style_preset ${presetAlias}
        ON ${presetAlias}.id = ${widgetAlias}.preset_id
    `;
  }

  private async ensureBonusBuyWidget(
    accountId: number,
  ): Promise<DbBonusBuyWidget> {
    const existing = await this.pool.query(
      `
        SELECT ${this.widgetSelectColumns()}
        ${this.widgetFromJoin()}
        WHERE w.account_id = $1
      `,
      [accountId],
    );

    if (existing.rows[0]) {
      return this.mapBonusBuyWidgetRow(existing.rows[0]);
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const bootstrapPreset = await this.resolveBootstrapWidgetPreset(
        client,
        accountId,
      );
      await client.query(
        BONUS_BUY_WIDGET_INSERT_SQL,
        bonusBuyWidgetInsertParams(accountId, bootstrapPreset.presetId),
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const created = await this.pool.query(
      `
        SELECT ${this.widgetSelectColumns()}
        ${this.widgetFromJoin()}
        WHERE w.account_id = $1
      `,
      [accountId],
    );

    const row = created.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapBonusBuyWidgetRow(row);
  }

  async getBonusBuyWidget(accountId: number): Promise<DbBonusBuyWidget> {
    return this.ensureBonusBuyWidget(accountId);
  }

  private async getAccessibleBonusBuyWidgetPreset(
    accountId: number,
    presetId: number,
  ): Promise<DbBonusBuyWidgetStylePreset | null> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number | null;
      created_by_user_id: string | number | null;
      source: string;
      name: string;
      style_settings: BonusBuyWidgetStyleSettings;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          id,
          account_id,
          created_by_user_id,
          source,
          name,
          style_settings,
          created_at,
          updated_at
        FROM bonus_buy_widget_style_preset
        WHERE id = $1
          AND (source = 'system' OR account_id = $2)
      `,
      [presetId, accountId],
    );

    const row = result.rows[0];
    return row ? this.mapBonusBuyWidgetPresetRow(row) : null;
  }

  async patchBonusBuyWidget(
    accountId: number,
    input: PatchBonusBuyWidgetInput,
  ): Promise<DbBonusBuyWidget> {
    const existing = await this.ensureBonusBuyWidget(accountId);

    let nextPresetId =
      input.presetId !== undefined ? input.presetId : existing.presetId;

    if (input.presetId !== undefined) {
      if (input.presetId === null) {
        throw new Error('PRESET_ID_REQUIRED');
      }

      const preset = await this.getAccessibleBonusBuyWidgetPreset(
        accountId,
        input.presetId,
      );
      if (!preset) {
        throw new Error('PRESET_NOT_FOUND');
      }

      nextPresetId = input.presetId;
    }

    const next = {
      width:
        input.width !== undefined
          ? this.clampWidgetDimension(input.width)
          : existing.width,
      height:
        input.height !== undefined
          ? this.clampWidgetDimension(input.height)
          : existing.height,
      presetId: nextPresetId,
    };

    await this.pool.query(
      `
        UPDATE bonus_buy_widget
        SET
          width = $2,
          height = $3,
          preset_id = $4,
          updated_at = now()
        WHERE account_id = $1
      `,
      [accountId, next.width, next.height, next.presetId],
    );

    const result = await this.pool.query(
      `
        SELECT ${this.widgetSelectColumns()}
        ${this.widgetFromJoin()}
        WHERE w.account_id = $1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapBonusBuyWidgetRow(row);
  }

  async listBonusBuyWidgetPresets(
    accountId: number,
  ): Promise<DbBonusBuyWidgetStylePreset[]> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number | null;
      created_by_user_id: string | number | null;
      source: string;
      name: string;
      style_settings: BonusBuyWidgetStyleSettings;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          id,
          account_id,
          created_by_user_id,
          source,
          name,
          style_settings,
          created_at,
          updated_at
        FROM bonus_buy_widget_style_preset
        WHERE source = 'system'
           OR account_id = $1
        ORDER BY
          CASE WHEN source = 'user' THEN 0 ELSE 1 END,
          id ASC
      `,
      [accountId],
    );

    return result.rows.map((row) => this.mapBonusBuyWidgetPresetRow(row));
  }

  async upsertBonusBuyWidgetCustomPreset(
    accountId: number,
    createdByUserId: number,
    input: UpsertBonusBuyWidgetCustomPresetInput,
  ): Promise<DbBonusBuyWidgetStylePreset> {
    const styleSettings = parseBonusBuyWidgetStyleSettings(input.styleSettings);

    const updated = await this.pool.query<{
      id: string | number;
      account_id: string | number | null;
      created_by_user_id: string | number | null;
      source: string;
      name: string;
      style_settings: BonusBuyWidgetStyleSettings;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        UPDATE bonus_buy_widget_style_preset
        SET
          style_settings = $3::jsonb,
          created_by_user_id = $2,
          updated_at = now()
        WHERE account_id = $1
          AND source = 'user'
        RETURNING
          id,
          account_id,
          created_by_user_id,
          source,
          name,
          style_settings,
          created_at,
          updated_at
      `,
      [accountId, createdByUserId, JSON.stringify(styleSettings)],
    );

    if (updated.rows[0]) {
      return this.mapBonusBuyWidgetPresetRow(updated.rows[0]);
    }

    const inserted = await this.pool.query<{
      id: string | number;
      account_id: string | number | null;
      created_by_user_id: string | number | null;
      source: string;
      name: string;
      style_settings: BonusBuyWidgetStyleSettings;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        INSERT INTO bonus_buy_widget_style_preset (
          account_id,
          created_by_user_id,
          source,
          name,
          style_settings
        )
        VALUES ($1, $2, 'user', 'Custom', $3::jsonb)
        RETURNING
          id,
          account_id,
          created_by_user_id,
          source,
          name,
          style_settings,
          created_at,
          updated_at
      `,
      [accountId, createdByUserId, JSON.stringify(styleSettings)],
    );

    return this.mapBonusBuyWidgetPresetRow(inserted.rows[0]);
  }

  async deleteBonusBuyWidgetCustomPreset(accountId: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const customPreset = await client.query<{ id: string | number }>(
        `
          SELECT id
          FROM bonus_buy_widget_style_preset
          WHERE account_id = $1
            AND source = 'user'
        `,
        [accountId],
      );

      const customRow = customPreset.rows[0];
      if (!customRow) {
        throw new Error('NOT_FOUND');
      }

      const customPresetId = toInt(customRow.id);
      const fallbackPresetId = await this.resolveDefaultSystemWidgetPresetId(
        client,
      );

      await client.query(
        `
          UPDATE bonus_buy_widget
          SET preset_id = $2, updated_at = now()
          WHERE account_id = $1
            AND preset_id = $3
        `,
        [accountId, fallbackPresetId, customPresetId],
      );

      const deleted = await client.query(
        `
          DELETE FROM bonus_buy_widget_style_preset
          WHERE id = $1
            AND account_id = $2
            AND source = 'user'
        `,
        [customPresetId, accountId],
      );

      if (deleted.rowCount === 0) {
        throw new Error('NOT_FOUND');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async loadPublicBonusBuyWidgetActiveView(
    accountId: number,
    bonusBuyId: number,
  ): Promise<{
    record: DbPublicBonusBuyRecord;
    slots: DbBonusBuySlot[];
    settings: DbBonusBuyWidget;
  }> {
    const recordResult = await this.pool.query<{
      id: string | number;
      name: string;
      start_balance: string;
      currency_code: string;
      status: string;
    }>(
      `
        SELECT
          id,
          name,
          start_balance::text AS start_balance,
          currency_code,
          status
        FROM bonus_buy
        WHERE id = $1
          AND account_id = $2
          AND status = 'live'
      `,
      [bonusBuyId, accountId],
    );

    const recordRow = recordResult.rows[0];
    if (!recordRow) {
      throw new Error('NOT_FOUND');
    }

    const settings = await this.ensureBonusBuyWidget(accountId);

    const slotsResult = await this.pool.query<{
      id: string | number;
      bonus_buy_id: string | number;
      created_by_user_id: string | number;
      created_by_name: string;
      name: string;
      provider_name: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      status: string;
      sort_order: string | number;
      created_at: Date;
    }>(
      `
        SELECT
          s.id,
          s.bonus_buy_id,
          s.created_by_user_id,
          u.name AS created_by_name,
          s.name,
          s.provider_name,
          s.purchase_amount::text AS purchase_amount,
          s.win_amount::text AS win_amount,
          s.multiplier::text AS multiplier,
          s.status,
          s.sort_order,
          s.created_at
        FROM bonus_buy_slot s
        JOIN users u ON u.id = s.created_by_user_id
        WHERE s.bonus_buy_id = $1
          AND s.status != 'archived'
        ORDER BY s.sort_order ASC, s.id ASC
      `,
      [bonusBuyId],
    );

    return {
      record: {
        id: toInt(recordRow.id),
        name: recordRow.name,
        startBalance: recordRow.start_balance,
        currencyCode: recordRow.currency_code.trim().toUpperCase(),
        status: recordRow.status as BonusBuyStatus,
      },
      slots: slotsResult.rows.map((row) => this.mapBonusBuySlotRow(row)),
      settings,
    };
  }

  async getPublicBonusBuyWidgetViewByUcid(
    ucid: string,
  ): Promise<PublicBonusBuyWidgetViewResult> {
    const accountId = await this.getAccountIdByUcid(ucid);
    if (accountId === null) {
      return { kind: 'not_found' };
    }

    const sessionCheck = await this.pool.query<{
      has_non_archived: boolean;
      live_id: string | number | null;
    }>(
      `
        SELECT
          EXISTS (
            SELECT 1
            FROM bonus_buy
            WHERE account_id = $1
              AND status != 'archived'
          ) AS has_non_archived,
          (
            SELECT id
            FROM bonus_buy
            WHERE account_id = $1
              AND status = 'live'
            ORDER BY id DESC
            LIMIT 1
          ) AS live_id
      `,
      [accountId],
    );

    const checkRow = sessionCheck.rows[0];
    if (!checkRow?.has_non_archived) {
      return { kind: 'unavailable', reason: 'no_sessions' };
    }

    if (checkRow.live_id === null) {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    const liveId = toInt(checkRow.live_id);
    const active = await this.loadPublicBonusBuyWidgetActiveView(
      accountId,
      liveId,
    );

    return {
      kind: 'active',
      ...active,
    };
  }

  async getPublicPrizeSpinWidgetViewByUcid(
    ucid: string,
  ): Promise<PublicPrizeSpinWidgetViewResult> {
    const accountId = await this.getAccountIdByUcid(ucid);
    if (accountId === null) {
      return { kind: 'not_found' };
    }

    const sessionCheck = await this.pool.query<{
      has_non_archived: boolean;
      live_id: string | number | null;
    }>(
      `
        SELECT
          EXISTS (
            SELECT 1
            FROM prize_spin
            WHERE account_id = $1
              AND status != 'archived'
          ) AS has_non_archived,
          (
            SELECT id
            FROM prize_spin
            WHERE account_id = $1
              AND status = 'live'
            ORDER BY id DESC
            LIMIT 1
          ) AS live_id
      `,
      [accountId],
    );

    const checkRow = sessionCheck.rows[0];
    if (!checkRow?.has_non_archived) {
      return { kind: 'unavailable', reason: 'no_sessions' };
    }

    if (checkRow.live_id === null) {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    const liveId = toInt(checkRow.live_id);
    const view = await this.getPublicPrizeSpinWidgetView(liveId);
    if (!view) {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    if (view.record.status !== 'live') {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    return {
      kind: 'active',
      record: view.record,
      sectors: view.sectors,
      latestWin: view.latestWin,
      settings: view.settings,
    };
  }

  async archiveBonusBuySlot(
    accountId: number,
    bonusBuyId: number,
    slotId: number,
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `
          UPDATE bonus_buy_slot s
          SET status = 'archived'
          FROM bonus_buy bb
          WHERE s.bonus_buy_id = bb.id
            AND bb.account_id = $1
            AND s.bonus_buy_id = $2
            AND s.id = $3
            AND s.status != 'archived'
        `,
        [accountId, bonusBuyId, slotId],
      );

      if (result.rowCount === 0) {
        throw new Error('NOT_FOUND');
      }

      await this.compactBonusBuySlotSortOrders(client, bonusBuyId);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async reorderBonusBuySlots(
    accountId: number,
    bonusBuyId: number,
    slotIds: number[],
  ): Promise<DbBonusBuySlot[]> {
    await this.requireMutableBonusBuy(accountId, bonusBuyId);

    const uniqueIds = new Set(slotIds);
    if (uniqueIds.size !== slotIds.length) {
      throw new Error('INVALID_SLOT_REORDER');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const active = await client.query<{ id: string | number }>(
        `
          SELECT s.id
          FROM bonus_buy_slot s
          JOIN bonus_buy bb ON bb.id = s.bonus_buy_id
          WHERE bb.account_id = $1
            AND s.bonus_buy_id = $2
            AND s.status != 'archived'
          ORDER BY s.sort_order ASC, s.id ASC
        `,
        [accountId, bonusBuyId],
      );

      const activeIds = active.rows.map((row) => toInt(row.id));
      if (
        activeIds.length !== slotIds.length ||
        !slotIds.every((id) => activeIds.includes(id))
      ) {
        throw new Error('INVALID_SLOT_REORDER');
      }

      for (let index = 0; index < slotIds.length; index += 1) {
        await client.query(
          `
            UPDATE bonus_buy_slot
            SET sort_order = $3
            WHERE bonus_buy_id = $1
              AND id = $2
              AND status != 'archived'
          `,
          [bonusBuyId, slotIds[index], index + 1],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.listBonusBuySlots(accountId, bonusBuyId);
  }

  private mapPrizeSpinRow(row: {
    id: string | number;
    account_id: string | number;
    title: string;
    status: string;
    created_at: Date;
    created_by_user_id: string | number;
    created_by_name: string;
  }): DbPrizeSpin {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      title: row.title,
      status: row.status as PrizeSpinStatus,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    };
  }

  private async requireMutablePrizeSpin(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpin> {
    const session = await this.getPrizeSpinById(accountId, prizeSpinId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }
    if (session.status === 'archived') {
      throw new Error('NOT_FOUND');
    }
    return session;
  }

  async getPrizeSpinById(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpin | null> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          ps.id,
          ps.account_id,
          ps.title,
          ps.status,
          ps.created_at,
          ps.created_by_user_id,
          u.name AS created_by_name
        FROM prize_spin ps
        JOIN users u ON u.id = ps.created_by_user_id
        WHERE ps.account_id = $1
          AND ps.id = $2
      `,
      [accountId, prizeSpinId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return this.mapPrizeSpinRow(row);
  }

  async listPrizeSpins(
    accountId: number,
    archived: PrizeSpinArchivedFilter = 'false',
    page = 1,
    limit = 10,
  ): Promise<{
    records: DbPrizeSpin[];
    total: number;
    page: number;
    limit: number;
  }> {
    const archivedClause =
      archived === 'all'
        ? ''
        : archived === 'true'
          ? "AND ps.status = 'archived'"
          : "AND ps.status IN ('live', 'off_air')";
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query<{ count: string | number }>(
      `
        SELECT COUNT(*)::text AS count
        FROM prize_spin ps
        WHERE ps.account_id = $1
          ${archivedClause}
      `,
      [accountId],
    );

    const total = toInt(countResult.rows[0]?.count ?? 0);

    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          ps.id,
          ps.account_id,
          ps.title,
          ps.status,
          ps.created_at,
          ps.created_by_user_id,
          u.name AS created_by_name
        FROM prize_spin ps
        JOIN users u ON u.id = ps.created_by_user_id
        WHERE ps.account_id = $1
          ${archivedClause}
        ORDER BY ps.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [accountId, limit, offset],
    );

    return {
      records: result.rows.map((row) => this.mapPrizeSpinRow(row)),
      total,
      page,
      limit,
    };
  }

  async createPrizeSpin(
    accountId: number,
    createdByUserId: number,
    title: string,
  ): Promise<DbPrizeSpin> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM prize_spin
            WHERE account_id = $1
              AND status = 'live'
          ) AS has_live
        `,
        [accountId],
      );
      const initialStatus = initialSessionStatusOnCreate(
        liveCheck.rows[0]?.has_live ?? false,
      );

      const result = await client.query<{
        id: string | number;
        account_id: string | number;
        title: string;
        status: string;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          INSERT INTO prize_spin (account_id, created_by_user_id, title, status)
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            account_id,
            title,
            status,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [accountId, createdByUserId, trimmedTitle, initialStatus],
      );

      await client.query(
        PRIZE_SPIN_WIDGET_INSERT_SQL,
        prizeSpinWidgetInsertParams(accountId),
      );

      await client.query('COMMIT');

      const row = result.rows[0];
      return this.mapPrizeSpinRow(row);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAccountIdByUcid(ucid: string): Promise<number | null> {
    if (!isUuid(ucid)) {
      return null;
    }

    const result = await this.pool.query<{ id: string | number }>(
      `
        SELECT id
        FROM accounts
        WHERE ucid = $1
        LIMIT 1
      `,
      [ucid],
    );

    const row = result.rows[0];
    return row ? toInt(row.id) : null;
  }

  async archivePrizeSpin(
    accountId: number,
    prizeSpinId: number,
  ): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE prize_spin
        SET status = 'archived'
        WHERE account_id = $1
          AND id = $2
      `,
      [accountId, prizeSpinId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async patchPrizeSpin(
    accountId: number,
    prizeSpinId: number,
    input: PatchPrizeSpinInput,
  ): Promise<DbPrizeSpin> {
    const existing = await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    if (input.title === undefined) {
      return existing;
    }

    const trimmedTitle = input.title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      status: string;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        UPDATE prize_spin
        SET title = $3
        WHERE account_id = $1
          AND id = $2
        RETURNING
          id,
          account_id,
          title,
          status,
          created_at,
          created_by_user_id,
          (SELECT name FROM users WHERE id = created_by_user_id) AS created_by_name
      `,
      [accountId, prizeSpinId, trimmedTitle],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapPrizeSpinRow(row);
  }

  async goLivePrizeSpin(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpin> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const targetResult = await client.query<{ status: string }>(
        `
          SELECT status
          FROM prize_spin
          WHERE account_id = $1
            AND id = $2
          LIMIT 1
        `,
        [accountId, prizeSpinId],
      );
      const target = targetResult.rows[0];
      if (!target || target.status === 'archived') {
        throw new Error('NOT_FOUND');
      }

      if (target.status === 'live') {
        await client.query('COMMIT');
        const row = await this.getPrizeSpinById(accountId, prizeSpinId);
        if (!row) {
          throw new Error('NOT_FOUND');
        }
        return row;
      }

      await client.query(
        `
          UPDATE prize_spin
          SET status = 'off_air'
          WHERE account_id = $1
            AND status = 'live'
        `,
        [accountId],
      );

      const promoteResult = await client.query<{
        id: string | number;
        account_id: string | number;
        title: string;
        status: string;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          UPDATE prize_spin ps
          SET status = 'live'
          FROM users u
          WHERE ps.created_by_user_id = u.id
            AND ps.account_id = $1
            AND ps.id = $2
            AND ps.status = 'off_air'
          RETURNING
            ps.id,
            ps.account_id,
            ps.title,
            ps.status,
            ps.created_at,
            ps.created_by_user_id,
            u.name AS created_by_name
        `,
        [accountId, prizeSpinId],
      );

      if (promoteResult.rowCount === 0) {
        throw new Error('NOT_FOUND');
      }

      await client.query('COMMIT');
      return this.mapPrizeSpinRow(promoteResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async copyPrizeSpin(
    accountId: number,
    sourcePrizeSpinId: number,
    createdByUserId: number,
    title: string,
  ): Promise<DbPrizeSpin> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const source = await this.getPrizeSpinById(accountId, sourcePrizeSpinId);
    if (!source) {
      throw new Error('NOT_FOUND');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM prize_spin
            WHERE account_id = $1
              AND status = 'live'
          ) AS has_live
        `,
        [accountId],
      );
      const initialStatus = initialSessionStatusOnCreate(
        liveCheck.rows[0]?.has_live ?? false,
      );

      const result = await client.query<{
        id: string | number;
        account_id: string | number;
        title: string;
        status: string;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          INSERT INTO prize_spin (account_id, created_by_user_id, title, status)
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            account_id,
            title,
            status,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [accountId, createdByUserId, trimmedTitle, initialStatus],
      );

      const newPrizeSpinId = toInt(result.rows[0].id);

      const sectors = await client.query<{
        label: string;
        win_percent: string;
        color: string | null;
        sort_order: number;
      }>(
        `
          SELECT
            label,
            win_percent::text AS win_percent,
            color,
            sort_order
          FROM prize_spin_sector
          WHERE prize_spin_id = $1
            AND is_archived = false
          ORDER BY sort_order ASC, id ASC
        `,
        [sourcePrizeSpinId],
      );

      for (const sector of sectors.rows) {
        await client.query(
          `
            INSERT INTO prize_spin_sector (
              prize_spin_id,
              label,
              win_percent,
              color,
              sort_order
            )
            VALUES ($1, $2, $3, $4, $5)
          `,
          [
            newPrizeSpinId,
            sector.label,
            sector.win_percent,
            sector.color,
            sector.sort_order,
          ],
        );
      }

      await client.query('COMMIT');

      return this.mapPrizeSpinRow(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private mapPrizeSpinSectorRow(row: {
    id: string | number;
    prize_spin_id: string | number;
    label: string;
    win_percent: string;
    color: string | null;
    sort_order: number;
    created_at: Date;
  }): DbPrizeSpinSector {
    return {
      id: toInt(row.id),
      prizeSpinId: toInt(row.prize_spin_id),
      label: row.label,
      winPercent: row.win_percent,
      color: row.color,
      sortOrder: row.sort_order,
      isArchived: false,
      createdAt: row.created_at,
    };
  }

  private mapPrizeSpinWinRow(row: {
    id: string | number;
    prize_spin_id: string | number;
    sector_id: string | number;
    sector_label: string;
    participant_nick: string;
    spun_by_name: string;
    created_at: Date;
  }): DbPrizeSpinWin {
    return {
      id: toInt(row.id),
      prizeSpinId: toInt(row.prize_spin_id),
      sectorId: toInt(row.sector_id),
      participantNick: row.participant_nick,
      spunByUserId: 0,
      spunByName: row.spun_by_name,
      isArchived: false,
      createdAt: row.created_at,
      sectorLabel: row.sector_label,
    };
  }

  private async getActiveSectorWinPercentSum(
    prizeSpinId: number,
    excludeSectorId?: number,
  ): Promise<number> {
    const result = await this.pool.query<{ total: string }>(
      `
        SELECT COALESCE(SUM(win_percent), 0)::text AS total
        FROM prize_spin_sector
        WHERE prize_spin_id = $1
          AND is_archived = false
          AND ($2::bigint IS NULL OR id <> $2)
      `,
      [prizeSpinId, excludeSectorId ?? null],
    );

    return Number.parseFloat(result.rows[0]?.total ?? '0');
  }

  async listPrizeSpinSectors(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpinSector[]> {
    const session = await this.getPrizeSpinById(accountId, prizeSpinId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    const result = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      label: string;
      win_percent: string;
      color: string | null;
      sort_order: number;
      created_at: Date;
    }>(
      `
        SELECT
          id,
          prize_spin_id,
          label,
          win_percent::text AS win_percent,
          color,
          sort_order,
          created_at
        FROM prize_spin_sector
        WHERE prize_spin_id = $1
          AND is_archived = false
        ORDER BY sort_order ASC, id ASC
      `,
      [prizeSpinId],
    );

    return result.rows.map((row) => this.mapPrizeSpinSectorRow(row));
  }

  async createPrizeSpinSector(
    accountId: number,
    prizeSpinId: number,
    label: string,
    winPercent: string,
    color: string | null | undefined,
  ): Promise<DbPrizeSpinSector> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const trimmedLabel = label.trim();
    if (trimmedLabel.length === 0 || trimmedLabel.length > 100) {
      throw new Error('INVALID_LABEL');
    }

    const normalizedWinPercent = normalizeWinPercent(winPercent);
    const currentSum = await this.getActiveSectorWinPercentSum(prizeSpinId);
    const nextSum =
      currentSum + Number.parseFloat(normalizedWinPercent);
    if (nextSum > 100) {
      throw new Error('WIN_PERCENT_SUM_EXCEEDED');
    }

    const countResult = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM prize_spin_sector
        WHERE prize_spin_id = $1 AND is_archived = false
      `,
      [prizeSpinId],
    );
    const sectorCount = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);

    const normalizedColor =
      color === undefined
        ? defaultSectorColor(sectorCount)
        : normalizeHexColor(color) ?? defaultSectorColor(sectorCount);

    const sortResult = await this.pool.query<{ max_order: number | null }>(
      `
        SELECT MAX(sort_order) AS max_order
        FROM prize_spin_sector
        WHERE prize_spin_id = $1 AND is_archived = false
      `,
      [prizeSpinId],
    );
    const nextSortOrder = (sortResult.rows[0]?.max_order ?? -1) + 1;

    const result = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      label: string;
      win_percent: string;
      color: string | null;
      sort_order: number;
      created_at: Date;
    }>(
      `
        INSERT INTO prize_spin_sector (
          prize_spin_id,
          label,
          win_percent,
          color,
          sort_order
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          prize_spin_id,
          label,
          win_percent::text AS win_percent,
          color,
          sort_order,
          created_at
      `,
      [
        prizeSpinId,
        trimmedLabel,
        normalizedWinPercent,
        normalizedColor,
        nextSortOrder,
      ],
    );

    return this.mapPrizeSpinSectorRow(result.rows[0]);
  }

  async patchPrizeSpinSector(
    accountId: number,
    prizeSpinId: number,
    sectorId: number,
    input: PatchPrizeSpinSectorInput,
  ): Promise<DbPrizeSpinSector> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const existing = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      label: string;
      win_percent: string;
      color: string | null;
      sort_order: number;
      created_at: Date;
      is_archived: boolean;
    }>(
      `
        SELECT
          s.id,
          s.prize_spin_id,
          s.label,
          s.win_percent::text AS win_percent,
          s.color,
          s.sort_order,
          s.created_at,
          s.is_archived
        FROM prize_spin_sector s
        JOIN prize_spin ps ON ps.id = s.prize_spin_id
        WHERE ps.account_id = $1
          AND s.prize_spin_id = $2
          AND s.id = $3
      `,
      [accountId, prizeSpinId, sectorId],
    );

    const row = existing.rows[0];
    if (!row || row.is_archived) {
      throw new Error('NOT_FOUND');
    }

    let nextLabel = row.label;
    if (input.label !== undefined) {
      const trimmed = input.label.trim();
      if (trimmed.length === 0 || trimmed.length > 100) {
        throw new Error('INVALID_LABEL');
      }
      nextLabel = trimmed;
    }

    let nextWinPercent = row.win_percent;
    if (input.winPercent !== undefined) {
      nextWinPercent = normalizeWinPercent(input.winPercent);
      const otherSum = await this.getActiveSectorWinPercentSum(
        prizeSpinId,
        sectorId,
      );
      const nextSum =
        otherSum + Number.parseFloat(nextWinPercent);
      if (nextSum > 100) {
        throw new Error('WIN_PERCENT_SUM_EXCEEDED');
      }
    }

    let nextColor = row.color;
    if (input.color !== undefined) {
      nextColor =
        input.color === null
          ? defaultSectorColor(row.sort_order)
          : normalizeHexColor(input.color);
    }

    const result = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      label: string;
      win_percent: string;
      color: string | null;
      sort_order: number;
      created_at: Date;
    }>(
      `
        UPDATE prize_spin_sector
        SET
          label = $3,
          win_percent = $4,
          color = $5
        WHERE id = $1
          AND prize_spin_id = $2
          AND is_archived = false
        RETURNING
          id,
          prize_spin_id,
          label,
          win_percent::text AS win_percent,
          color,
          sort_order,
          created_at
      `,
      [sectorId, prizeSpinId, nextLabel, nextWinPercent, nextColor],
    );

    return this.mapPrizeSpinSectorRow(result.rows[0]);
  }

  async distributePrizeSpinSectorsEqually(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpinSector[]> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const sectors = await this.listPrizeSpinSectors(accountId, prizeSpinId);
    if (sectors.length === 0) {
      throw new Error('NO_SECTORS');
    }

    const percents = equalWinPercents(sectors.length);
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (let index = 0; index < sectors.length; index += 1) {
        await client.query(
          `
            UPDATE prize_spin_sector s
            SET win_percent = $4
            FROM prize_spin ps
            WHERE s.prize_spin_id = ps.id
              AND ps.account_id = $1
              AND s.prize_spin_id = $2
              AND s.id = $3
              AND s.is_archived = false
          `,
          [accountId, prizeSpinId, sectors[index].id, percents[index]],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.listPrizeSpinSectors(accountId, prizeSpinId);
  }

  async archivePrizeSpinSector(
    accountId: number,
    prizeSpinId: number,
    sectorId: number,
  ): Promise<void> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const result = await this.pool.query(
      `
        UPDATE prize_spin_sector s
        SET is_archived = true
        FROM prize_spin ps
        WHERE s.prize_spin_id = ps.id
          AND ps.account_id = $1
          AND s.prize_spin_id = $2
          AND s.id = $3
          AND s.is_archived = false
          AND ps.status != 'archived'
      `,
      [accountId, prizeSpinId, sectorId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async listPrizeSpinWins(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpinWin[]> {
    const session = await this.getPrizeSpinById(accountId, prizeSpinId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    const result = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      sector_id: string | number;
      sector_label: string;
      participant_nick: string;
      spun_by_name: string;
      created_at: Date;
    }>(
      `
        SELECT
          w.id,
          w.prize_spin_id,
          w.sector_id,
          s.label AS sector_label,
          w.participant_nick,
          u.name AS spun_by_name,
          w.created_at
        FROM prize_spin_win w
        JOIN prize_spin_sector s ON s.id = w.sector_id
        JOIN users u ON u.id = w.spun_by_user_id
        WHERE w.prize_spin_id = $1
          AND w.is_archived = false
        ORDER BY w.created_at DESC
      `,
      [prizeSpinId],
    );

    return result.rows.map((row) => this.mapPrizeSpinWinRow(row));
  }

  async archivePrizeSpinWin(
    accountId: number,
    prizeSpinId: number,
    winId: number,
  ): Promise<void> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const result = await this.pool.query(
      `
        UPDATE prize_spin_win w
        SET is_archived = true
        FROM prize_spin ps
        WHERE w.prize_spin_id = ps.id
          AND ps.account_id = $1
          AND w.prize_spin_id = $2
          AND w.id = $3
          AND w.is_archived = false
          AND ps.status != 'archived'
      `,
      [accountId, prizeSpinId, winId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async archiveAllPrizeSpinWins(
    accountId: number,
    prizeSpinId: number,
  ): Promise<void> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    await this.pool.query(
      `
        UPDATE prize_spin_win w
        SET is_archived = true
        FROM prize_spin ps
        WHERE w.prize_spin_id = ps.id
          AND ps.account_id = $1
          AND w.prize_spin_id = $2
          AND w.is_archived = false
          AND ps.status != 'archived'
      `,
      [accountId, prizeSpinId],
    );
  }

  async spinPrizeSpin(
    accountId: number,
    prizeSpinId: number,
    spunByUserId: number,
    participantNick: string,
  ): Promise<DbPrizeSpinWin> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const trimmedNick = participantNick.trim();
    if (trimmedNick.length === 0 || trimmedNick.length > 100) {
      throw new Error('INVALID_PARTICIPANT_NICK');
    }

    const sectors = await this.listPrizeSpinSectors(accountId, prizeSpinId);
    if (sectors.length < 2) {
      throw new Error('INSUFFICIENT_SECTORS');
    }

    const totalWinPercent = sectors.reduce(
      (sum, sector) => sum + Number.parseFloat(sector.winPercent),
      0,
    );
    if (!isCompleteWinPercentTotal(totalWinPercent)) {
      throw new Error('WIN_PERCENT_SUM_INCOMPLETE');
    }

    const winningSectorId = pickWeightedSectorId(sectors);
    const winningSector = sectors.find((sector) => sector.id === winningSectorId);
    if (!winningSector) {
      throw new Error('INSUFFICIENT_SECTORS');
    }

    const result = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      sector_id: string | number;
      sector_label: string;
      participant_nick: string;
      spun_by_name: string;
      created_at: Date;
    }>(
      `
        INSERT INTO prize_spin_win (
          prize_spin_id,
          sector_id,
          participant_nick,
          spun_by_user_id
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          prize_spin_id,
          sector_id,
          $5::text AS sector_label,
          participant_nick,
          (SELECT name FROM users WHERE id = $4) AS spun_by_name,
          created_at
      `,
      [
        prizeSpinId,
        winningSectorId,
        trimmedNick,
        spunByUserId,
        winningSector.label,
      ],
    );

    return this.mapPrizeSpinWinRow(result.rows[0]);
  }

  async revokeModeratorPermanently(
    accountId: number,
    ownerUserId: number,
    moderatorUserId: number,
  ): Promise<void> {
    const isOwner = await this.isAccountOwner(accountId, ownerUserId);
    if (!isOwner) {
      throw new Error('FORBIDDEN');
    }

    const target = await this.pool.query<{ role: 'owner' | 'moderator' }>(
      `
        SELECT role FROM account_members
        WHERE account_id = $1 AND user_id = $2
      `,
      [accountId, moderatorUserId],
    );

    if (!target.rows[0] || target.rows[0].role !== 'moderator') {
      throw new Error('MODERATOR_NOT_FOUND');
    }

    await this.pool.query(
      `
        UPDATE auth_credentials
        SET is_active = false, updated_at = now()
        WHERE user_id = $1 AND provider = 'access_link'
      `,
      [moderatorUserId],
    );

    const result = await this.pool.query(
      `
        UPDATE account_members
        SET is_active = false, updated_at = now()
        WHERE account_id = $1 AND user_id = $2 AND role = 'moderator'
      `,
      [accountId, moderatorUserId],
    );

    if (result.rowCount === 0) {
      throw new Error('MODERATOR_NOT_FOUND');
    }
  }

  private mapPrizeSpinWidgetRow(row: {
    id: string | number;
    account_id: string | number;
    width: string | number;
    height: string | number;
    equal_sector_slices: boolean;
    show_sector_weight_in_winner: boolean;
    created_at: Date;
    updated_at: Date;
  }): DbPrizeSpinWidget {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      width: toInt(row.width),
      height: toInt(row.height),
      equalSectorSlices: row.equal_sector_slices,
      showSectorWeightInWinner: row.show_sector_weight_in_winner,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async ensureAccountPrizeSpinWidget(
    accountId: number,
  ): Promise<DbPrizeSpinWidget> {
    await this.pool.query(
      PRIZE_SPIN_WIDGET_INSERT_SQL,
      prizeSpinWidgetInsertParams(accountId),
    );

    const result = await this.pool.query(
      `
        SELECT
          w.id,
          w.account_id,
          w.width,
          w.height,
          w.equal_sector_slices,
          w.show_sector_weight_in_winner,
          w.created_at,
          w.updated_at
        FROM prize_spin_widget w
        WHERE w.account_id = $1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    const mapped = this.mapPrizeSpinWidgetRow(row);
    if (mapped.width === 500 && mapped.height === 500) {
      const upgraded = await this.pool.query(
        `
          UPDATE prize_spin_widget w
          SET
            width = $2,
            height = $3,
            updated_at = now()
          WHERE w.account_id = $1
          RETURNING
            w.id,
            w.account_id,
            w.width,
            w.height,
            w.equal_sector_slices,
            w.show_sector_weight_in_winner,
            w.created_at,
            w.updated_at
        `,
        [
          accountId,
          PRIZE_SPIN_WIDGET_DEFAULTS.width,
          PRIZE_SPIN_WIDGET_DEFAULTS.height,
        ],
      );
      const upgradedRow = upgraded.rows[0];
      if (upgradedRow) {
        return this.mapPrizeSpinWidgetRow(upgradedRow);
      }
    }

    return mapped;
  }

  async getPrizeSpinWidget(accountId: number): Promise<DbPrizeSpinWidget> {
    return this.ensureAccountPrizeSpinWidget(accountId);
  }

  async patchPrizeSpinWidget(
    accountId: number,
    input: PatchPrizeSpinWidgetInput,
  ): Promise<DbPrizeSpinWidget> {
    const existing = await this.ensureAccountPrizeSpinWidget(accountId);

    const next = {
      width:
        input.width !== undefined
          ? this.clampWidgetDimension(input.width)
          : existing.width,
      height:
        input.height !== undefined
          ? this.clampWidgetDimension(input.height)
          : existing.height,
      equalSectorSlices:
        input.equalSectorSlices !== undefined
          ? input.equalSectorSlices
          : existing.equalSectorSlices,
      showSectorWeightInWinner:
        input.showSectorWeightInWinner !== undefined
          ? input.showSectorWeightInWinner
          : existing.showSectorWeightInWinner,
    };

    const result = await this.pool.query(
      `
        UPDATE prize_spin_widget w
        SET
          width = $2,
          height = $3,
          equal_sector_slices = $4,
          show_sector_weight_in_winner = $5,
          updated_at = now()
        WHERE w.account_id = $1
        RETURNING
          w.id,
          w.account_id,
          w.width,
          w.height,
          w.equal_sector_slices,
          w.show_sector_weight_in_winner,
          w.created_at,
          w.updated_at
      `,
      [
        accountId,
        next.width,
        next.height,
        next.equalSectorSlices,
        next.showSectorWeightInWinner,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapPrizeSpinWidgetRow(row);
  }

  async getPublicPrizeSpinWidgetViewForPublic(
    prizeSpinId: number,
  ): Promise<
    | {
        record: DbPrizeSpin;
        sectors: DbPrizeSpinSector[];
        latestWin: DbPrizeSpinWin | null;
        settings: DbPrizeSpinWidget;
      }
    | 'NOT_FOUND'
  > {
    const statusResult = await this.pool.query<{ status: string }>(
      `SELECT status FROM prize_spin WHERE id = $1 LIMIT 1`,
      [prizeSpinId],
    );
    const statusRow = statusResult.rows[0];
    if (!statusRow || statusRow.status === 'archived') {
      return 'NOT_FOUND';
    }

    const view = await this.getPublicPrizeSpinWidgetView(prizeSpinId);
    if (!view) {
      return 'NOT_FOUND';
    }

    return view;
  }

  async getPublicPrizeSpinWidgetView(prizeSpinId: number): Promise<{
    record: DbPrizeSpin;
    sectors: DbPrizeSpinSector[];
    latestWin: DbPrizeSpinWin | null;
    settings: DbPrizeSpinWidget;
  } | null> {
    const recordResult = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      status: string;
      created_by_user_id: string | number;
      created_by_name: string;
      created_at: Date;
    }>(
      `
        SELECT
          ps.id,
          ps.account_id,
          ps.title,
          ps.status,
          ps.created_by_user_id,
          u.name AS created_by_name,
          ps.created_at
        FROM prize_spin ps
        JOIN users u ON u.id = ps.created_by_user_id
        WHERE ps.id = $1
          AND ps.status IN ('live', 'off_air')
      `,
      [prizeSpinId],
    );

    const recordRow = recordResult.rows[0];
    if (!recordRow) {
      return null;
    }

    const accountId = toInt(recordRow.account_id);
    const settings = await this.ensureAccountPrizeSpinWidget(accountId);

    const sectorsResult = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      label: string;
      win_percent: string;
      color: string | null;
      sort_order: number;
      created_at: Date;
    }>(
      `
        SELECT
          id,
          prize_spin_id,
          label,
          win_percent::text AS win_percent,
          color,
          sort_order,
          created_at
        FROM prize_spin_sector
        WHERE prize_spin_id = $1
          AND is_archived = false
        ORDER BY sort_order ASC, id ASC
      `,
      [prizeSpinId],
    );

    const latestWinResult = await this.pool.query<{
      id: string | number;
      prize_spin_id: string | number;
      sector_id: string | number;
      sector_label: string;
      participant_nick: string;
      spun_by_name: string;
      created_at: Date;
    }>(
      `
        SELECT
          w.id,
          w.prize_spin_id,
          w.sector_id,
          s.label AS sector_label,
          w.participant_nick,
          u.name AS spun_by_name,
          w.created_at
        FROM prize_spin_win w
        JOIN prize_spin_sector s ON s.id = w.sector_id
        JOIN users u ON u.id = w.spun_by_user_id
        WHERE w.prize_spin_id = $1
          AND w.is_archived = false
        ORDER BY w.created_at DESC
        LIMIT 1
      `,
      [prizeSpinId],
    );

    const record: DbPrizeSpin = this.mapPrizeSpinRow(recordRow);

    return {
      record,
      sectors: sectorsResult.rows.map((row) => this.mapPrizeSpinSectorRow(row)),
      latestWin: latestWinResult.rows[0]
        ? this.mapPrizeSpinWinRow(latestWinResult.rows[0])
        : null,
      settings,
    };
  }

  async getLiveChatRollByAccountId(
    accountId: number,
  ): Promise<DbChatRoll | null> {
    const result = await this.pool.query(
      `
        SELECT
          cr.id,
          cr.account_id,
          cr.title,
          cr.status,
          cr.keyword,
          cr.widget_keyword_prefix,
          cr.combine_mode,
          cr.exclude_winner_after_roll,
          cr.is_accepting_participants,
          cr.reply_in_chat,
          cr.winner_response_enabled,
          cr.winner_response_seconds,
          cr.show_winner_response_in_reveal,
          cr.role_settings,
          cr.created_at,
          cr.created_by_user_id,
          u.name AS created_by_name
        FROM chat_roll cr
        JOIN users u ON u.id = cr.created_by_user_id
        WHERE cr.account_id = $1
          AND cr.status = 'live'
        LIMIT 1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return this.mapChatRollRow(row);
  }

  async expirePendingChatRollWinResponses(chatRollId: number): Promise<void> {
    await this.pool.query(
      `
        UPDATE chat_roll_win
        SET response_status = 'no_response'
        WHERE chat_roll_id = $1
          AND response_status = 'pending'
          AND response_deadline_at IS NOT NULL
          AND response_deadline_at < now()
      `,
      [chatRollId],
    );
  }

  async confirmChatRollWinResponse(input: {
    chatRollId: number;
    providerUserId: string;
    responseMessage: string;
  }): Promise<number | null> {
    const result = await this.pool.query<{ id: string | number }>(
      `
        UPDATE chat_roll_win w
        SET
          response_status = 'confirmed',
          responded_at = now(),
          winner_response_message = $3
        FROM chat_roll_participant p
        WHERE w.participant_id = p.id
          AND w.chat_roll_id = $1
          AND w.response_status = 'pending'
          AND w.response_deadline_at > now()
          AND p.provider = 'kick'
          AND p.provider_user_id = $2
          AND w.id = (
            SELECT w2.id
            FROM chat_roll_win w2
            JOIN chat_roll_participant p2 ON p2.id = w2.participant_id
            WHERE w2.chat_roll_id = $1
              AND w2.response_status = 'pending'
              AND w2.response_deadline_at > now()
              AND p2.provider = 'kick'
              AND p2.provider_user_id = $2
            ORDER BY w2.created_at ASC, w2.id ASC
            LIMIT 1
          )
        RETURNING w.id
      `,
      [input.chatRollId, input.providerUserId, input.responseMessage],
    );

    const row = result.rows[0];
    return row ? toInt(row.id) : null;
  }

  async getAccountIdByKickChannelId(
    channelId: string,
  ): Promise<number | null> {
    const result = await this.pool.query<{ account_id: number }>(
      `
        SELECT account_id
        FROM account_channels
        WHERE provider = 'kick' AND channel_id = $1
        LIMIT 1
      `,
      [channelId],
    );
    const row = result.rows[0];
    return row ? toInt(row.account_id) : null;
  }

  private mapChatRollRow(row: {
    id: string | number;
    account_id: string | number;
    title: string;
    status: string;
    keyword: string;
    widget_keyword_prefix?: string;
    combine_mode: string;
    exclude_winner_after_roll: boolean;
    is_accepting_participants: boolean;
    reply_in_chat: boolean;
    winner_response_enabled?: boolean;
    winner_response_seconds?: string | number;
    show_winner_response_in_reveal?: boolean;
    role_settings: unknown;
    created_at: Date;
    created_by_user_id: string | number;
    created_by_name: string;
  }): DbChatRoll {
    const roleSettings =
      normalizeRoleSettings(row.role_settings) ?? DEFAULT_CHAT_ROLL_ROLE_SETTINGS;

    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      title: row.title,
      status: row.status as ChatRollStatus,
      keyword: row.keyword,
      widgetKeywordPrefix:
        row.widget_keyword_prefix ?? CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT,
      combineMode: row.combine_mode as 'highest' | 'sum',
      excludeWinnerAfterRoll: row.exclude_winner_after_roll,
      isAcceptingParticipants: row.is_accepting_participants,
      replyInChat: row.reply_in_chat,
      winnerResponseEnabled: row.winner_response_enabled ?? true,
      winnerResponseSeconds: toInt(row.winner_response_seconds ?? 25),
      showWinnerResponseInReveal:
        row.show_winner_response_in_reveal ?? true,
      roleSettings,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    };
  }

  private mapChatRollParticipantRow(row: {
    id: string | number;
    chat_roll_id: string | number;
    provider: string | null;
    provider_user_id: string | null;
    display_name: string;
    role_ids: string[];
    is_archived: boolean;
    excluded_from_roll_pool: boolean;
    is_eligible_for_roll?: boolean;
    joined_at: Date;
  }): DbChatRollParticipant {
    const excludedFromRollPool = row.excluded_from_roll_pool;
    const isEligibleForRoll =
      row.is_eligible_for_roll ?? !excludedFromRollPool;
    return {
      id: toInt(row.id),
      chatRollId: toInt(row.chat_roll_id),
      provider: row.provider as DbChatRollParticipant['provider'],
      providerUserId: row.provider_user_id,
      displayName: row.display_name,
      roleIds: row.role_ids ?? [],
      isArchived: row.is_archived,
      excludedFromRollPool,
      isEligibleForRoll,
      joinedAt: row.joined_at,
    };
  }

  private mapChatRollWinRow(row: {
    id: string | number;
    chat_roll_id: string | number;
    participant_id: string | number;
    display_name: string;
    coefficient_at_pick: string | number;
    rolled_by_user_id: string | number;
    rolled_by_name: string;
    roll_index: string | number;
    is_archived: boolean;
    response_status?: string;
    response_deadline_at?: Date | null;
    responded_at?: Date | null;
    created_at: Date;
    winner_response_message?: string | null;
  }): DbChatRollWin {
    return {
      id: toInt(row.id),
      chatRollId: toInt(row.chat_roll_id),
      participantId: toInt(row.participant_id),
      displayName: row.display_name,
      coefficientAtPick: String(row.coefficient_at_pick),
      rolledByUserId: toInt(row.rolled_by_user_id),
      rolledByName: row.rolled_by_name,
      rollIndex: toInt(row.roll_index),
      isArchived: row.is_archived,
      responseStatus: (row.response_status ??
        'not_required') as ChatRollWinResponseStatus,
      responseDeadlineAt: row.response_deadline_at ?? null,
      respondedAt: row.responded_at ?? null,
      createdAt: row.created_at,
      winnerResponseMessage: row.winner_response_message ?? null,
    };
  }

  private mapChatRollWidgetRow(row: {
    id: string | number;
    account_id: string | number;
    width: string | number;
    height: string | number;
    created_at: Date;
    updated_at: Date;
  }): DbChatRollWidget {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      width: toInt(row.width),
      height: toInt(row.height),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private async requireMutableChatRoll(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRoll> {
    const session = await this.getChatRollById(accountId, chatRollId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }
    if (session.status === 'archived') {
      throw new Error('NOT_FOUND');
    }
    return session;
  }

  async getChatRollById(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRoll | null> {
    const result = await this.pool.query(
      `
        SELECT
          cr.id,
          cr.account_id,
          cr.title,
          cr.status,
          cr.keyword,
          cr.widget_keyword_prefix,
          cr.combine_mode,
          cr.exclude_winner_after_roll,
          cr.is_accepting_participants,
          cr.reply_in_chat,
          cr.winner_response_enabled,
          cr.winner_response_seconds,
          cr.show_winner_response_in_reveal,
          cr.role_settings,
          cr.created_at,
          cr.created_by_user_id,
          u.name AS created_by_name
        FROM chat_roll cr
        JOIN users u ON u.id = cr.created_by_user_id
        WHERE cr.account_id = $1
          AND cr.id = $2
      `,
      [accountId, chatRollId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return this.mapChatRollRow(row);
  }

  async listChatRolls(
    accountId: number,
    archived: ChatRollArchivedFilter = 'false',
    page = 1,
    limit = 10,
  ): Promise<{
    records: DbChatRoll[];
    total: number;
    page: number;
    limit: number;
  }> {
    const archivedClause =
      archived === 'all'
        ? ''
        : archived === 'true'
          ? "AND cr.status = 'archived'"
          : "AND cr.status IN ('live', 'off_air')";
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query<{ count: string | number }>(
      `
        SELECT COUNT(*)::text AS count
        FROM chat_roll cr
        WHERE cr.account_id = $1
          ${archivedClause}
      `,
      [accountId],
    );

    const total = toInt(countResult.rows[0]?.count ?? 0);

    const result = await this.pool.query(
      `
        SELECT
          cr.id,
          cr.account_id,
          cr.title,
          cr.status,
          cr.keyword,
          cr.widget_keyword_prefix,
          cr.combine_mode,
          cr.exclude_winner_after_roll,
          cr.is_accepting_participants,
          cr.reply_in_chat,
          cr.winner_response_enabled,
          cr.winner_response_seconds,
          cr.show_winner_response_in_reveal,
          cr.role_settings,
          cr.created_at,
          cr.created_by_user_id,
          u.name AS created_by_name
        FROM chat_roll cr
        JOIN users u ON u.id = cr.created_by_user_id
        WHERE cr.account_id = $1
          ${archivedClause}
        ORDER BY cr.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [accountId, limit, offset],
    );

    return {
      records: result.rows.map((row) => this.mapChatRollRow(row)),
      total,
      page,
      limit,
    };
  }

  async createChatRoll(
    accountId: number,
    createdByUserId: number,
    title: string,
  ): Promise<DbChatRoll> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const keyword = '!roll';
    const combineMode = 'highest';
    const excludeWinnerAfterRoll = true;
    const replyInChat = false;
    const winnerResponseEnabled = true;
    const winnerResponseSeconds = 25;
    const showWinnerResponseInReveal = true;
    const roleSettings = DEFAULT_CHAT_ROLL_ROLE_SETTINGS;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const prefixResult = await client.query<{ widget_keyword_prefix: string }>(
        `
          SELECT widget_keyword_prefix
          FROM chat_roll
          WHERE account_id = $1
            AND status != 'archived'
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [accountId],
      );
      const widgetKeywordPrefix =
        prefixResult.rows[0]?.widget_keyword_prefix ??
        CHAT_ROLL_WIDGET_KEYWORD_PREFIX_DEFAULT;

      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM chat_roll
            WHERE account_id = $1
              AND status = 'live'
          ) AS has_live
        `,
        [accountId],
      );
      const initialStatus = initialSessionStatusOnCreate(
        liveCheck.rows[0]?.has_live ?? false,
      );

      const result = await client.query(
        `
          INSERT INTO chat_roll (
            account_id,
            created_by_user_id,
            title,
            status,
            keyword,
            widget_keyword_prefix,
            combine_mode,
            exclude_winner_after_roll,
            reply_in_chat,
            winner_response_enabled,
            winner_response_seconds,
            show_winner_response_in_reveal,
            role_settings
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING
            id,
            account_id,
            title,
            status,
            keyword,
            widget_keyword_prefix,
            combine_mode,
            exclude_winner_after_roll,
            is_accepting_participants,
            reply_in_chat,
            winner_response_enabled,
            winner_response_seconds,
            show_winner_response_in_reveal,
            role_settings,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [
          accountId,
          createdByUserId,
          trimmedTitle,
          initialStatus,
          keyword,
          widgetKeywordPrefix,
          combineMode,
          excludeWinnerAfterRoll,
          replyInChat,
          winnerResponseEnabled,
          winnerResponseSeconds,
          showWinnerResponseInReveal,
          JSON.stringify(roleSettings),
        ],
      );

      await client.query(
        CHAT_ROLL_WIDGET_INSERT_SQL,
        chatRollWidgetInsertParams(accountId),
      );

      await client.query('COMMIT');

      return this.mapChatRollRow(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async archiveChatRoll(accountId: number, chatRollId: number): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE chat_roll
        SET status = 'archived'
        WHERE account_id = $1
          AND id = $2
      `,
      [accountId, chatRollId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async goLiveChatRoll(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRoll> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const targetResult = await client.query<{ status: string }>(
        `
          SELECT status
          FROM chat_roll
          WHERE account_id = $1
            AND id = $2
          LIMIT 1
        `,
        [accountId, chatRollId],
      );
      const target = targetResult.rows[0];
      if (!target || target.status === 'archived') {
        throw new Error('NOT_FOUND');
      }

      if (target.status === 'live') {
        await client.query('COMMIT');
        const row = await this.getChatRollById(accountId, chatRollId);
        if (!row) {
          throw new Error('NOT_FOUND');
        }
        return row;
      }

      await client.query(
        `
          UPDATE chat_roll
          SET status = 'off_air'
          WHERE account_id = $1
            AND status = 'live'
        `,
        [accountId],
      );

      const promoteResult = await client.query(
        `
          UPDATE chat_roll cr
          SET status = 'live'
          FROM users u
          WHERE cr.created_by_user_id = u.id
            AND cr.account_id = $1
            AND cr.id = $2
            AND cr.status = 'off_air'
          RETURNING
            cr.id,
            cr.account_id,
            cr.title,
            cr.status,
            cr.keyword,
            cr.widget_keyword_prefix,
            cr.combine_mode,
            cr.exclude_winner_after_roll,
            cr.is_accepting_participants,
            cr.reply_in_chat,
            cr.winner_response_enabled,
            cr.winner_response_seconds,
            cr.show_winner_response_in_reveal,
            cr.role_settings,
            cr.created_at,
            cr.created_by_user_id,
            u.name AS created_by_name
        `,
        [accountId, chatRollId],
      );

      if (promoteResult.rowCount === 0) {
        throw new Error('NOT_FOUND');
      }

      await client.query('COMMIT');
      return this.mapChatRollRow(promoteResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deactivateChatRoll(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRoll> {
    const result = await this.pool.query(
      `
        UPDATE chat_roll cr
        SET status = 'off_air'
        FROM users u
        WHERE cr.created_by_user_id = u.id
          AND cr.account_id = $1
          AND cr.id = $2
          AND cr.status = 'live'
        RETURNING
          cr.id,
          cr.account_id,
          cr.title,
          cr.status,
          cr.keyword,
          cr.widget_keyword_prefix,
          cr.combine_mode,
          cr.exclude_winner_after_roll,
          cr.is_accepting_participants,
          cr.reply_in_chat,
          cr.winner_response_enabled,
          cr.winner_response_seconds,
          cr.show_winner_response_in_reveal,
          cr.role_settings,
          cr.created_at,
          cr.created_by_user_id,
          u.name AS created_by_name
      `,
      [accountId, chatRollId],
    );

    const row = result.rows[0];
    if (!row) {
      const existing = await this.getChatRollById(accountId, chatRollId);
      if (!existing) {
        throw new Error('NOT_FOUND');
      }
      throw new Error('NOT_LIVE');
    }

    return this.mapChatRollRow(row);
  }

  async patchChatRoll(
    accountId: number,
    chatRollId: number,
    input: PatchChatRollInput,
  ): Promise<DbChatRoll> {
    const existing = await this.requireMutableChatRoll(accountId, chatRollId);

    const nextTitle =
      input.title !== undefined ? input.title.trim() : existing.title;
    if (nextTitle.length === 0 || nextTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const nextKeyword =
      input.keyword !== undefined
        ? normalizeKeyword(input.keyword)
        : existing.keyword;
    if (nextKeyword === null) {
      throw new Error('INVALID_KEYWORD');
    }

    const nextWidgetKeywordPrefix =
      input.widgetKeywordPrefix !== undefined
        ? normalizeWidgetKeywordPrefix(input.widgetKeywordPrefix)
        : existing.widgetKeywordPrefix;
    if (nextWidgetKeywordPrefix === null) {
      throw new Error('INVALID_WIDGET_KEYWORD_PREFIX');
    }

    const nextCombineMode = input.combineMode ?? existing.combineMode;
    if (nextCombineMode !== 'highest' && nextCombineMode !== 'sum') {
      throw new Error('INVALID_COMBINE_MODE');
    }

    const nextRoleSettings =
      input.roleSettings !== undefined
        ? normalizeRoleSettings(input.roleSettings)
        : existing.roleSettings;
    if (nextRoleSettings === null) {
      throw new Error('INVALID_ROLE_SETTINGS');
    }

    const nextWinnerResponseEnabled =
      input.winnerResponseEnabled ?? existing.winnerResponseEnabled;
    const nextWinnerResponseSeconds =
      input.winnerResponseSeconds ?? existing.winnerResponseSeconds;
    if (
      !Number.isFinite(nextWinnerResponseSeconds) ||
      nextWinnerResponseSeconds < 10 ||
      nextWinnerResponseSeconds > 300
    ) {
      throw new Error('INVALID_WINNER_RESPONSE_SECONDS');
    }

    const result = await this.pool.query(
      `
        UPDATE chat_roll cr
        SET
          title = $3,
          keyword = $4,
          widget_keyword_prefix = $5,
          combine_mode = $6,
          exclude_winner_after_roll = $7,
          is_accepting_participants = $8,
          reply_in_chat = $9,
          winner_response_enabled = $10,
          winner_response_seconds = $11,
          show_winner_response_in_reveal = $12,
          role_settings = $13
        FROM users u
        WHERE cr.created_by_user_id = u.id
          AND cr.account_id = $1
          AND cr.id = $2
          AND cr.status != 'archived'
        RETURNING
          cr.id,
          cr.account_id,
          cr.title,
          cr.status,
          cr.keyword,
          cr.widget_keyword_prefix,
          cr.combine_mode,
          cr.exclude_winner_after_roll,
          cr.is_accepting_participants,
          cr.reply_in_chat,
          cr.winner_response_enabled,
          cr.winner_response_seconds,
          cr.show_winner_response_in_reveal,
          cr.role_settings,
          cr.created_at,
          cr.created_by_user_id,
          u.name AS created_by_name
      `,
      [
        accountId,
        chatRollId,
        nextTitle,
        nextKeyword,
        nextWidgetKeywordPrefix,
        nextCombineMode,
        input.excludeWinnerAfterRoll ?? existing.excludeWinnerAfterRoll,
        input.isAcceptingParticipants ?? existing.isAcceptingParticipants,
        input.replyInChat ?? existing.replyInChat,
        nextWinnerResponseEnabled,
        nextWinnerResponseSeconds,
        input.showWinnerResponseInReveal ?? existing.showWinnerResponseInReveal,
        JSON.stringify(nextRoleSettings),
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapChatRollRow(row);
  }

  async getPublicChatRollWidgetViewByUcid(
    ucid: string,
  ): Promise<PublicChatRollWidgetViewResult> {
    const accountId = await this.getAccountIdByUcid(ucid);
    if (accountId === null) {
      return { kind: 'not_found' };
    }

    const sessionCheck = await this.pool.query<{
      has_non_archived: boolean;
      live_id: string | number | null;
    }>(
      `
        SELECT
          EXISTS (
            SELECT 1
            FROM chat_roll
            WHERE account_id = $1
              AND status != 'archived'
          ) AS has_non_archived,
          (
            SELECT id
            FROM chat_roll
            WHERE account_id = $1
              AND status = 'live'
            ORDER BY id DESC
            LIMIT 1
          ) AS live_id
      `,
      [accountId],
    );

    const checkRow = sessionCheck.rows[0];
    if (!checkRow?.has_non_archived) {
      return { kind: 'unavailable', reason: 'no_sessions' };
    }

    if (checkRow.live_id === null) {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    const liveId = toInt(checkRow.live_id);
    const session = await this.getChatRollById(accountId, liveId);
    if (!session || session.status !== 'live') {
      return { kind: 'unavailable', reason: 'no_live_session' };
    }

    return {
      kind: 'active',
      record: {
        id: session.id,
        keyword: session.keyword,
        widgetKeywordPrefix: session.widgetKeywordPrefix,
        status: session.status,
      },
    };
  }

  async listChatRollParticipants(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRollParticipant[]> {
    const session = await this.getChatRollById(accountId, chatRollId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    await this.expirePendingChatRollWinResponses(chatRollId);

    const result = await this.pool.query(
      `
        SELECT
          p.id,
          p.chat_roll_id,
          p.provider,
          p.provider_user_id,
          p.display_name,
          p.role_ids,
          p.is_archived,
          p.excluded_from_roll_pool,
          p.joined_at,
          (
            NOT p.excluded_from_roll_pool
            AND NOT (
              cr.exclude_winner_after_roll
              AND EXISTS (
                SELECT 1
                FROM chat_roll_win w
                INNER JOIN chat_roll_participant pw ON pw.id = w.participant_id
                WHERE w.chat_roll_id = p.chat_roll_id
                  AND w.is_archived = false
                  AND pw.provider IS NOT DISTINCT FROM p.provider
                  AND pw.provider_user_id IS NOT DISTINCT FROM p.provider_user_id
              )
            )
          ) AS is_eligible_for_roll
        FROM chat_roll_participant p
        JOIN chat_roll cr ON cr.id = p.chat_roll_id
        WHERE cr.account_id = $1
          AND p.chat_roll_id = $2
          AND p.is_archived = false
        ORDER BY
          CASE
            WHEN (
              NOT p.excluded_from_roll_pool
              AND NOT (
                cr.exclude_winner_after_roll
                AND EXISTS (
                  SELECT 1
                  FROM chat_roll_win w
                  INNER JOIN chat_roll_participant pw ON pw.id = w.participant_id
                  WHERE w.chat_roll_id = p.chat_roll_id
                    AND w.is_archived = false
                    AND pw.provider IS NOT DISTINCT FROM p.provider
                    AND pw.provider_user_id IS NOT DISTINCT FROM p.provider_user_id
                )
              )
            ) THEN 0
            ELSE 1
          END,
          p.joined_at ASC,
          p.id ASC
      `,
      [accountId, chatRollId],
    );

    return result.rows.map((row) => this.mapChatRollParticipantRow(row));
  }

  async archiveChatRollParticipant(
    accountId: number,
    chatRollId: number,
    participantId: number,
  ): Promise<void> {
    await this.requireMutableChatRoll(accountId, chatRollId);

    const result = await this.pool.query(
      `
        UPDATE chat_roll_participant p
        SET is_archived = true
        FROM chat_roll cr
        WHERE cr.id = p.chat_roll_id
          AND cr.account_id = $1
          AND p.chat_roll_id = $2
          AND p.id = $3
          AND p.is_archived = false
      `,
      [accountId, chatRollId, participantId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async archiveAllChatRollParticipants(
    accountId: number,
    chatRollId: number,
  ): Promise<void> {
    await this.requireMutableChatRoll(accountId, chatRollId);

    await this.pool.query(
      `
        UPDATE chat_roll_participant p
        SET is_archived = true
        FROM chat_roll cr
        WHERE cr.id = p.chat_roll_id
          AND cr.account_id = $1
          AND p.chat_roll_id = $2
          AND p.is_archived = false
      `,
      [accountId, chatRollId],
    );
  }

  async listChatRollWins(
    accountId: number,
    chatRollId: number,
  ): Promise<DbChatRollWin[]> {
    const session = await this.getChatRollById(accountId, chatRollId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    await this.expirePendingChatRollWinResponses(chatRollId);

    const result = await this.pool.query(
      `
        SELECT
          w.id,
          w.chat_roll_id,
          w.participant_id,
          w.display_name,
          w.coefficient_at_pick,
          w.rolled_by_user_id,
          u.name AS rolled_by_name,
          w.roll_index,
          w.is_archived,
          w.response_status,
          w.response_deadline_at,
          w.responded_at,
          w.created_at,
          w.winner_response_message
        FROM chat_roll_win w
        JOIN users u ON u.id = w.rolled_by_user_id
        WHERE w.chat_roll_id = $1
          AND w.is_archived = false
        ORDER BY w.created_at DESC, w.id DESC
      `,
      [chatRollId],
    );

    return result.rows.map((row) => this.mapChatRollWinRow(row));
  }

  async archiveChatRollWin(
    accountId: number,
    chatRollId: number,
    winId: number,
  ): Promise<void> {
    await this.requireMutableChatRoll(accountId, chatRollId);

    const result = await this.pool.query(
      `
        UPDATE chat_roll_win w
        SET is_archived = true
        FROM chat_roll cr
        WHERE cr.id = w.chat_roll_id
          AND cr.account_id = $1
          AND w.chat_roll_id = $2
          AND w.id = $3
          AND w.is_archived = false
      `,
      [accountId, chatRollId, winId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
  }

  async archiveAllChatRollWins(
    accountId: number,
    chatRollId: number,
  ): Promise<void> {
    await this.requireMutableChatRoll(accountId, chatRollId);

    await this.pool.query(
      `
        UPDATE chat_roll_win w
        SET is_archived = true
        FROM chat_roll cr
        WHERE cr.id = w.chat_roll_id
          AND cr.account_id = $1
          AND w.chat_roll_id = $2
          AND w.is_archived = false
      `,
      [accountId, chatRollId],
    );
  }

  async rollChatRoll(
    accountId: number,
    chatRollId: number,
    rolledByUserId: number,
  ): Promise<DbChatRollWin> {
    const session = await this.requireMutableChatRoll(accountId, chatRollId);
    const participants = (
      await this.listChatRollParticipants(accountId, chatRollId)
    ).filter((participant) => participant.isEligibleForRoll);

    const winner = pickWeightedParticipant(
      participants.map((participant) => ({
        id: participant.id,
        roleIds: participant.roleIds,
      })),
      session.roleSettings,
      session.combineMode,
    );

    if (!winner) {
      throw new Error('NO_ELIGIBLE_PARTICIPANTS');
    }

    const pickedParticipant = participants.find(
      (participant) => participant.id === winner.id,
    );
    if (!pickedParticipant) {
      throw new Error('NO_ELIGIBLE_PARTICIPANTS');
    }

    const coefficient = computeParticipantCoefficient(
      pickedParticipant.roleIds,
      session.roleSettings,
      session.combineMode,
    );

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const rollIndexResult = await client.query<{ next_index: string | number }>(
        `
          SELECT COALESCE(MAX(roll_index), 0) + 1 AS next_index
          FROM chat_roll_win
          WHERE chat_roll_id = $1
        `,
        [chatRollId],
      );
      const rollIndex = toInt(rollIndexResult.rows[0]?.next_index ?? 1);

      const responseStatus: ChatRollWinResponseStatus =
        session.winnerResponseEnabled ? 'pending' : 'not_required';

      const insertResult = await client.query(
        `
          INSERT INTO chat_roll_win (
            chat_roll_id,
            participant_id,
            display_name,
            coefficient_at_pick,
            rolled_by_user_id,
            roll_index,
            response_status,
            response_deadline_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            CASE
              WHEN $7 = 'pending' THEN now() + ($8::double precision * interval '1 second')
              ELSE NULL
            END
          )
          RETURNING
            id,
            chat_roll_id,
            participant_id,
            display_name,
            coefficient_at_pick,
            rolled_by_user_id,
            roll_index,
            is_archived,
            response_status,
            response_deadline_at,
            responded_at,
            created_at,
            winner_response_message
        `,
        [
          chatRollId,
          pickedParticipant.id,
          pickedParticipant.displayName,
          coefficient.toFixed(1),
          rolledByUserId,
          rollIndex,
          responseStatus,
          session.winnerResponseSeconds,
        ],
      );

      await client.query(
        `
          UPDATE chat_roll_participant
          SET excluded_from_roll_pool = true
          WHERE id = $1
            AND chat_roll_id = $2
        `,
        [pickedParticipant.id, chatRollId],
      );

      await client.query('COMMIT');

      const winRow = insertResult.rows[0];
      const rolledByResult = await this.pool.query<{ name: string }>(
        `SELECT name FROM users WHERE id = $1`,
        [rolledByUserId],
      );

      return this.mapChatRollWinRow({
        ...winRow,
        rolled_by_name: rolledByResult.rows[0]?.name ?? '',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async ensureAccountChatRollWidget(
    accountId: number,
  ): Promise<DbChatRollWidget> {
    await this.pool.query(
      CHAT_ROLL_WIDGET_INSERT_SQL,
      chatRollWidgetInsertParams(accountId),
    );

    const result = await this.pool.query(
      `
        SELECT
          w.id,
          w.account_id,
          w.width,
          w.height,
          w.created_at,
          w.updated_at
        FROM chat_roll_widget w
        WHERE w.account_id = $1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapChatRollWidgetRow(row);
  }

  async getChatRollWidget(accountId: number): Promise<DbChatRollWidget> {
    return this.ensureAccountChatRollWidget(accountId);
  }

  async patchChatRollWidget(
    accountId: number,
    input: PatchChatRollWidgetInput,
  ): Promise<DbChatRollWidget> {
    const existing = await this.ensureAccountChatRollWidget(accountId);

    const next = {
      width:
        input.width !== undefined
          ? this.clampWidgetDimension(input.width)
          : existing.width,
      height:
        input.height !== undefined
          ? this.clampWidgetDimension(input.height)
          : existing.height,
    };

    const result = await this.pool.query(
      `
        UPDATE chat_roll_widget w
        SET
          width = $2,
          height = $3,
          updated_at = now()
        WHERE w.account_id = $1
        RETURNING
          w.id,
          w.account_id,
          w.width,
          w.height,
          w.created_at,
          w.updated_at
      `,
      [accountId, next.width, next.height],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapChatRollWidgetRow(row);
  }

  async getChatRollForIntake(
    accountId: number,
    keyword: string,
  ): Promise<DbChatRollIntakeSession | null> {
    const result = await this.pool.query<{
      id: number;
      account_id: number;
      keyword: string;
      is_accepting_participants: boolean;
      reply_in_chat: boolean;
      role_settings: unknown;
    }>(
      `
        SELECT id, account_id, keyword, is_accepting_participants, reply_in_chat, role_settings
        FROM chat_roll
        WHERE account_id = $1
          AND status = 'live'
          AND lower(trim(keyword)) = lower(trim($2))
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [accountId, keyword],
    );
    const row = result.rows[0];
    if (!row) {
      return null;
    }
    const roleSettings =
      normalizeRoleSettings(row.role_settings) ??
      DEFAULT_CHAT_ROLL_ROLE_SETTINGS;

    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      keyword: row.keyword,
      isAcceptingParticipants: row.is_accepting_participants,
      replyInChat: row.reply_in_chat,
      roleSettings,
    };
  }

  async recordKickChatEvent(input: {
    messageId: string;
    broadcasterId: string;
    senderId: string;
    content: string;
  }): Promise<boolean> {
    const result = await this.pool.query(
      `
        INSERT INTO kick_chat_events (message_id, broadcaster_id, sender_id, content)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (message_id) DO NOTHING
        RETURNING message_id
      `,
      [input.messageId, input.broadcasterId, input.senderId, input.content],
    );
    return Boolean(result.rows[0]);
  }

  private async chatRollProviderUserHasActiveWin(
    chatRollId: number,
    provider: 'kick',
    providerUserId: string,
  ): Promise<boolean> {
    const result = await this.pool.query(
      `
        SELECT 1
        FROM chat_roll_win w
        INNER JOIN chat_roll_participant p ON p.id = w.participant_id
        WHERE w.chat_roll_id = $1
          AND p.provider = $2
          AND p.provider_user_id = $3
          AND w.is_archived = false
        LIMIT 1
      `,
      [chatRollId, provider, providerUserId],
    );
    return Boolean(result.rows[0]);
  }

  async insertChatRollParticipantFromChat(input: {
    chatRollId: number;
    provider: 'kick';
    providerUserId: string;
    displayName: string;
    roleIds: string[];
  }): Promise<
    | { status: 'created'; participantId: number }
    | { status: 'duplicate' }
    | { status: 'entries_paused' }
  > {
    const sessionResult = await this.pool.query<{
      is_accepting_participants: boolean;
      exclude_winner_after_roll: boolean;
    }>(
      `
        SELECT is_accepting_participants, exclude_winner_after_roll
        FROM chat_roll
        WHERE id = $1
        LIMIT 1
      `,
      [input.chatRollId],
    );
    const session = sessionResult.rows[0];
    if (!session) {
      return { status: 'entries_paused' };
    }
    if (!session.is_accepting_participants) {
      return { status: 'entries_paused' };
    }

    const existing = await this.pool.query<{
      id: number;
      excluded_from_roll_pool: boolean;
    }>(
      `
        SELECT id, excluded_from_roll_pool
        FROM chat_roll_participant
        WHERE chat_roll_id = $1
          AND provider = $2
          AND provider_user_id = $3
          AND is_archived = false
        LIMIT 1
      `,
      [input.chatRollId, input.provider, input.providerUserId],
    );
    if (existing.rows[0]) {
      if (existing.rows[0].excluded_from_roll_pool) {
        if (
          session.exclude_winner_after_roll &&
          (await this.chatRollProviderUserHasActiveWin(
            input.chatRollId,
            input.provider,
            input.providerUserId,
          ))
        ) {
          return { status: 'duplicate' };
        }

        await this.pool.query(
          `
            UPDATE chat_roll_participant
            SET
              excluded_from_roll_pool = false,
              display_name = $3,
              role_ids = $4
            WHERE id = $1
              AND chat_roll_id = $2
          `,
          [
            existing.rows[0].id,
            input.chatRollId,
            input.displayName,
            input.roleIds,
          ],
        );
        return {
          status: 'created',
          participantId: toInt(existing.rows[0].id),
        };
      }
      return { status: 'duplicate' };
    }

    if (
      session.exclude_winner_after_roll &&
      (await this.chatRollProviderUserHasActiveWin(
        input.chatRollId,
        input.provider,
        input.providerUserId,
      ))
    ) {
      return { status: 'duplicate' };
    }

    const insertResult = await this.pool.query<{ id: number }>(
      `
        INSERT INTO chat_roll_participant (
          chat_roll_id,
          provider,
          provider_user_id,
          display_name,
          role_ids
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        input.chatRollId,
        input.provider,
        input.providerUserId,
        input.displayName,
        input.roleIds,
      ],
    );

    return {
      status: 'created',
      participantId: toInt(insertResult.rows[0].id),
    };
  }

  async isPlatformAdmin(userId: number): Promise<boolean> {
    const result = await this.pool.query(
      `
        SELECT 1
        FROM platform_admins
        WHERE user_id = $1 AND revoked_at IS NULL
        LIMIT 1
      `,
      [userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async searchSubscriptionAdminAccounts(input: {
    query: string;
    page: number;
    pageSize: number;
    sortBy: import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminSortField;
    sortOrder: 'asc' | 'desc';
  }): Promise<
    import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminSearchResult
  > {
    const trimmed = input.query.trim();
    const listAll = trimmed.length === 0;
    const accountId =
      !listAll && /^\d+$/.test(trimmed)
        ? Number.parseInt(trimmed, 10)
        : null;
    const uuidMatch =
      !listAll &&
      trimmed.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    const ucid = uuidMatch ? trimmed : null;
    const text =
      !listAll && accountId === null && ucid === null ? `%${trimmed}%` : null;

    const sortColumns: Record<
      import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminSortField,
      string
    > = {
      accountId: 'a.id',
      name: 'a.name',
      subscriptionPlan: 'a.subscription_plan',
      channelSlug: 'ch.channel_slug',
      endsAt: 's.ends_at',
      updatedAt: 'a.updated_at',
    };
    const sortColumn = sortColumns[input.sortBy] ?? sortColumns.updatedAt;
    const sortDirection = input.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (input.page - 1) * input.pageSize;

    const countResult = await this.pool.query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS total
        FROM accounts a
        LEFT JOIN LATERAL (
          SELECT channel_slug
          FROM account_channels
          WHERE account_id = a.id AND provider = 'kick'
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        ) ch ON true
        WHERE
          ($4::boolean IS TRUE)
          OR ($1::bigint IS NOT NULL AND a.id = $1::bigint)
          OR ($2::uuid IS NOT NULL AND a.ucid = $2::uuid)
          OR (
            $3::text IS NOT NULL
            AND (
              a.name ILIKE $3
              OR ch.channel_slug ILIKE $3
            )
          )
      `,
      [accountId, ucid, text, listAll],
    );
    const total = countResult.rows[0]?.total ?? 0;

    if (total === 0) {
      return {
        items: [],
        total: 0,
        page: input.page,
        pageSize: input.pageSize,
      };
    }

    const result = await this.pool.query<{
      account_id: string | number;
      ucid: string;
      name: string;
      subscription_plan: string;
      channel_slug: string | null;
      status: AccountSubscriptionRow['status'] | null;
      plan_tier: string | null;
      starts_at: Date | null;
      ends_at: Date | null;
    }>(
      `
        SELECT
          a.id AS account_id,
          a.ucid,
          a.name,
          a.subscription_plan,
          ch.channel_slug,
          s.status,
          s.plan_tier,
          s.starts_at,
          s.ends_at
        FROM accounts a
        LEFT JOIN account_subscriptions s ON s.account_id = a.id
        LEFT JOIN LATERAL (
          SELECT channel_slug
          FROM account_channels
          WHERE account_id = a.id AND provider = 'kick'
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        ) ch ON true
        WHERE
          ($4::boolean IS TRUE)
          OR ($1::bigint IS NOT NULL AND a.id = $1::bigint)
          OR ($2::uuid IS NOT NULL AND a.ucid = $2::uuid)
          OR (
            $3::text IS NOT NULL
            AND (
              a.name ILIKE $3
              OR ch.channel_slug ILIKE $3
            )
          )
        ORDER BY ${sortColumn} ${sortDirection} NULLS LAST, a.id DESC
        OFFSET $5
        LIMIT $6
      `,
      [accountId, ucid, text, listAll, offset, input.pageSize],
    );

    const items: import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminSearchItem[] =
      [];

    for (const row of result.rows) {
      const item = await this.mapSubscriptionAdminSearchRow(row);
      if (item) {
        items.push(item);
      }
    }

    return {
      items,
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  async getSubscriptionAdminAccountDetail(
    accountId: number,
  ): Promise<
    import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminAccountDetail | null
  > {
    const result = await this.pool.query<{
      account_id: string | number;
      ucid: string;
      name: string;
      subscription_plan: string;
      channel_slug: string | null;
      status: AccountSubscriptionRow['status'] | null;
      plan_tier: string | null;
      starts_at: Date | null;
      ends_at: Date | null;
    }>(
      `
        SELECT
          a.id AS account_id,
          a.ucid,
          a.name,
          a.subscription_plan,
          ch.channel_slug,
          s.status,
          s.plan_tier,
          s.starts_at,
          s.ends_at
        FROM accounts a
        LEFT JOIN account_subscriptions s ON s.account_id = a.id
        LEFT JOIN LATERAL (
          SELECT channel_slug
          FROM account_channels
          WHERE account_id = a.id AND provider = 'kick'
          ORDER BY is_primary DESC, id ASC
          LIMIT 1
        ) ch ON true
        WHERE a.id = $1
        LIMIT 1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const base = await this.mapSubscriptionAdminSearchRow(row);
    if (!base) {
      return null;
    }

    const ownersResult = await this.pool.query<{
      user_id: string | number;
      name: string;
    }>(
      `
        SELECT u.id AS user_id, u.name
        FROM account_members am
        JOIN users u ON u.id = am.user_id
        WHERE am.account_id = $1
          AND am.role = 'owner'
          AND am.is_active = true
        ORDER BY u.name
      `,
      [accountId],
    );

    return {
      ...base,
      owners: ownersResult.rows.map((owner) => ({
        userId: toInt(owner.user_id),
        name: owner.name,
      })),
    };
  }

  async applySubscriptionAdminUpdate(
    accountId: number,
    operatorUserId: number,
    input: {
      mode: 'revoked' | 'trial' | 'paid';
      paidPlan?: 'pro' | 'max';
      endsAt?: Date;
      planTier: string;
    },
  ): Promise<
    import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminAccountDetail | null
  > {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const exists = await client.query<{ id: number }>(
        `SELECT id FROM accounts WHERE id = $1 LIMIT 1`,
        [accountId],
      );
      if (!exists.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      const before = await this.loadSubscriptionAdminAuditPayload(accountId, client);

      let subscriptionPlan = 'free';
      let status: AccountSubscriptionRow['status'] = 'expired';
      let endsAt = new Date();

      if (input.mode === 'revoked') {
        subscriptionPlan = 'free';
        status = 'expired';
        endsAt = new Date();
      } else if (input.mode === 'trial') {
        subscriptionPlan = 'trial';
        status = 'active';
        endsAt = input.endsAt!;
      } else {
        subscriptionPlan = input.paidPlan!;
        status = 'active';
        endsAt = input.endsAt!;
      }

      const planTier =
        input.planTier === 'pro' ||
        input.planTier === 'max' ||
        input.planTier === 'trial'
          ? input.planTier
          : input.mode === 'trial'
            ? 'trial'
            : input.paidPlan ?? 'pro';

      await client.query(
        `
          UPDATE accounts
          SET subscription_plan = $2, updated_at = now()
          WHERE id = $1
        `,
        [accountId, subscriptionPlan],
      );

      await client.query(
        `
          INSERT INTO account_subscriptions (
            account_id, status, plan_tier, starts_at, ends_at
          )
          VALUES ($1, $2, $3, now(), $4)
          ON CONFLICT (account_id) DO UPDATE SET
            status = EXCLUDED.status,
            plan_tier = EXCLUDED.plan_tier,
            ends_at = EXCLUDED.ends_at,
            updated_at = now(),
            starts_at = CASE
              WHEN EXCLUDED.status = 'active'
                AND account_subscriptions.status IS DISTINCT FROM 'active'
              THEN now()
              ELSE account_subscriptions.starts_at
            END
        `,
        [accountId, status, planTier, endsAt],
      );

      const after = await this.loadSubscriptionAdminAuditPayload(accountId, client);

      await client.query(
        `
          INSERT INTO subscription_admin_events (
            operator_user_id, account_id, payload_before, payload_after
          )
          VALUES ($1, $2, $3::jsonb, $4::jsonb)
        `,
        [
          operatorUserId,
          accountId,
          JSON.stringify(before),
          JSON.stringify(after),
        ],
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.getSubscriptionAdminAccountDetail(accountId);
  }

  private async mapSubscriptionAdminSearchRow(row: {
    account_id: string | number;
    ucid: string;
    name: string;
    subscription_plan: string;
    channel_slug: string | null;
    status: AccountSubscriptionRow['status'] | null;
    plan_tier: string | null;
    starts_at: Date | null;
    ends_at: Date | null;
  }): Promise<
    import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminSearchItem | null
  > {
    const accountId = toInt(row.account_id);
    const subscriptionRow = this.mapAccountSubscriptionRow(row);
    if (subscriptionRow && shouldMarkSubscriptionExpired(subscriptionRow)) {
      await this.expireAccountSubscriptionIfNeeded(accountId);
      subscriptionRow.status = 'expired';
    }
    const subscription = resolveAccountSubscriptionAccess(subscriptionRow);

    return {
      accountId,
      ucid: row.ucid,
      name: row.name,
      subscriptionPlan: row.subscription_plan,
      channelSlug: row.channel_slug,
      subscription,
    };
  }

  private async loadSubscriptionAdminAuditPayload(
    accountId: number,
    client: { query: Pool['query'] },
  ): Promise<
    import('../internal-admin/internal-subscriptions.types.js').SubscriptionAdminAuditPayload
  > {
    const result = await client.query<{
      subscription_plan: string;
      status: AccountSubscriptionRow['status'] | null;
      plan_tier: string | null;
      starts_at: Date | null;
      ends_at: Date | null;
    }>(
      `
        SELECT
          a.subscription_plan,
          s.status,
          s.plan_tier,
          s.starts_at,
          s.ends_at
        FROM accounts a
        LEFT JOIN account_subscriptions s ON s.account_id = a.id
        WHERE a.id = $1
        LIMIT 1
      `,
      [accountId],
    );

    const row = result.rows[0];
    if (!row) {
      return {
        subscriptionPlan: 'free',
        subscription: null,
      };
    }

    const subscriptionRow = this.mapAccountSubscriptionRow({
      status: row.status,
      plan_tier: row.plan_tier,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
    });
    const subscription = subscriptionRow
      ? resolveAccountSubscriptionAccess(subscriptionRow)
      : null;

    return {
      subscriptionPlan: row.subscription_plan,
      subscription,
    };
  }
}

export type DbChatRollIntakeSession = {
  id: number;
  accountId: number;
  keyword: string;
  isAcceptingParticipants: boolean;
  replyInChat: boolean;
  roleSettings: ChatRollRoleSettings;
};
