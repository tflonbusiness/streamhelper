import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import type { KickProfile } from '../auth/auth.types.js';
import {
  computeMultiplier,
  normalizeSignedMoney,
  normalizePositiveMoney,
} from '../bonus-buy/bonus-buy-math.js';
import {
  BONUS_BUY_WIDGET_INSERT_SQL,
  bonusBuyWidgetInsertParams,
} from '../bonus-buy/bonus-buy-widget-defaults.js';
import {
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
};

export type DbAccountMember = {
  userId: number;
  name: string;
  role: 'owner' | 'moderator';
  isActive: boolean;
  hasInviteLink: boolean;
};

export type DbBonusBuy = {
  id: number;
  accountId: number;
  title: string;
  startBalance: string;
  isActive: boolean;
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
  createdAt: Date;
  updatedAt: Date;
};

export type PatchPrizeSpinWidgetInput = {
  width?: number;
  height?: number;
};

export type PatchPrizeSpinSectorInput = {
  label?: string;
  winPercent?: string;
  color?: string | null;
};

export type DbBonusBuySlot = {
  id: number;
  bonusBuyId: number;
  createdByUserId: number;
  createdByName: string;
  slotName: string;
  nickProvider: string | null;
  purchaseAmount: string;
  winAmount: string | null;
  multiplier: string | null;
  isNowPlaying: boolean;
  createdAt: Date;
};

export type PatchBonusBuySlotInput = {
  slotName?: string;
  nickProvider?: string | null;
  purchaseAmount?: string;
  winAmount?: string | null;
  isNowPlaying?: boolean;
};

export type DbBonusBuyWidget = {
  id: number;
  accountId: number;
  width: number;
  height: number;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  accentColor: string;
  positiveColor: string;
  negativeColor: string;
  liveColor: string;
  textMutedColor: string;
  borderRadius: number;
  padding: number;
  fontFamily: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PatchBonusBuyWidgetInput = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  accentColor?: string;
  positiveColor?: string;
  negativeColor?: string;
  liveColor?: string;
  textMutedColor?: string;
  borderRadius?: number;
  padding?: number;
  fontFamily?: string;
};

export type DbPublicBonusBuyRecord = {
  id: number;
  title: string;
  startBalance: string;
  isActive: boolean;
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
    await this.initSchema();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  private async initSchema(): Promise<void> {
    await this.pool.query(`
      DROP TABLE IF EXISTS prize_spin_win CASCADE;
      DROP TABLE IF EXISTS prize_spin_sector CASCADE;
      DROP TABLE IF EXISTS prize_spin_widget CASCADE;
      DROP TABLE IF EXISTS prize_spin CASCADE;
      DROP TABLE IF EXISTS bonus_buy_widget CASCADE;
      DROP TABLE IF EXISTS bonus_buy_slot CASCADE;
      DROP TABLE IF EXISTS bonus_buy CASCADE;
      DROP TABLE IF EXISTS account_channels CASCADE;
      DROP TABLE IF EXISTS account_members CASCADE;
      DROP TABLE IF EXISTS auth_credentials CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id          BIGSERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE auth_credentials (
        id                BIGSERIAL PRIMARY KEY,
        user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider          TEXT NOT NULL CHECK (provider IN ('kick', 'twitch', 'youtube', 'access_link')),
        provider_user_id  TEXT NOT NULL,
        provider_username TEXT,
        token_hash        TEXT,
        is_active         BOOLEAN NOT NULL DEFAULT true,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (provider, provider_user_id)
      );

      CREATE INDEX idx_auth_credentials_user ON auth_credentials(user_id);
      CREATE INDEX idx_auth_credentials_token_hash ON auth_credentials(token_hash)
        WHERE token_hash IS NOT NULL;

      CREATE TABLE accounts (
        id                BIGSERIAL PRIMARY KEY,
        ucid              UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        name              TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
        subscription_plan TEXT NOT NULL DEFAULT 'free',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE account_members (
        id          BIGSERIAL PRIMARY KEY,
        account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role        TEXT NOT NULL CHECK (role IN ('owner', 'moderator')),
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (account_id, user_id)
      );

      CREATE INDEX idx_members_user ON account_members(user_id);
      CREATE INDEX idx_members_account ON account_members(account_id);

      CREATE TABLE account_channels (
        id           BIGSERIAL PRIMARY KEY,
        account_id   BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        provider     TEXT NOT NULL CHECK (provider IN ('kick', 'twitch', 'youtube')),
        channel_id   TEXT NOT NULL,
        channel_slug TEXT NOT NULL,
        is_primary   BOOLEAN NOT NULL DEFAULT false,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (provider, channel_id)
      );

      CREATE INDEX idx_channels_account ON account_channels(account_id);

      CREATE TABLE bonus_buy (
        id                  BIGSERIAL PRIMARY KEY,
        account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
        title               TEXT NOT NULL,
        start_balance       NUMERIC(12, 2) NOT NULL,
        is_active           BOOLEAN NOT NULL DEFAULT true,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_bonus_buy_account_created
        ON bonus_buy (account_id, created_at DESC);

      CREATE TABLE bonus_buy_slot (
        id                  BIGSERIAL PRIMARY KEY,
        bonus_buy_id        BIGINT NOT NULL REFERENCES bonus_buy(id) ON DELETE CASCADE,
        created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
        slot_name           TEXT NOT NULL,
        nick_provider       TEXT,
        purchase_amount     NUMERIC(12, 2) NOT NULL,
        win_amount          NUMERIC(12, 2),
        multiplier          NUMERIC(10, 2),
        is_now_playing      BOOLEAN NOT NULL DEFAULT false,
        is_archived         BOOLEAN NOT NULL DEFAULT false,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_bonus_buy_slot_one_playing
        ON bonus_buy_slot (bonus_buy_id)
        WHERE is_now_playing = true AND is_archived = false;

      CREATE INDEX idx_bonus_buy_slot_list
        ON bonus_buy_slot (bonus_buy_id, created_at ASC)
        WHERE is_archived = false;

      CREATE TABLE bonus_buy_widget (
        id                  BIGSERIAL PRIMARY KEY,
        account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
        width               INTEGER NOT NULL DEFAULT 500,
        height              INTEGER NOT NULL DEFAULT 600,
        background_color    TEXT NOT NULL DEFAULT '#0A0A0C',
        surface_color       TEXT NOT NULL DEFAULT '#121215',
        border_color        TEXT NOT NULL DEFAULT '#2F2F31',
        accent_color        TEXT NOT NULL DEFAULT '#F59E0B',
        positive_color      TEXT NOT NULL DEFAULT '#10B981',
        negative_color      TEXT NOT NULL DEFAULT '#EF4444',
        live_color          TEXT NOT NULL DEFAULT '#FF2222',
        text_muted_color    TEXT NOT NULL DEFAULT '#9CA3AF',
        border_radius       INTEGER NOT NULL DEFAULT 20,
        padding             INTEGER NOT NULL DEFAULT 18,
        font_family         TEXT NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE prize_spin (
        id                  BIGSERIAL PRIMARY KEY,
        account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
        title               TEXT NOT NULL,
        status              TEXT NOT NULL DEFAULT 'off_air'
          CHECK (status IN ('live', 'off_air', 'archived')),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_prize_spin_account_created
        ON prize_spin (account_id, created_at DESC)
        WHERE status != 'archived';

      CREATE UNIQUE INDEX idx_prize_spin_account_live
        ON prize_spin (account_id)
        WHERE status = 'live';

      CREATE TABLE prize_spin_sector (
        id                  BIGSERIAL PRIMARY KEY,
        prize_spin_id       BIGINT NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE,
        label               TEXT NOT NULL,
        win_percent         NUMERIC(5, 2) NOT NULL
          CHECK (win_percent > 0 AND win_percent <= 100),
        color               TEXT,
        sort_order          INTEGER NOT NULL DEFAULT 0,
        is_archived         BOOLEAN NOT NULL DEFAULT false,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_prize_spin_sector_wheel
        ON prize_spin_sector (prize_spin_id, sort_order ASC, id ASC)
        WHERE is_archived = false;

      CREATE TABLE prize_spin_win (
        id                  BIGSERIAL PRIMARY KEY,
        prize_spin_id       BIGINT NOT NULL REFERENCES prize_spin(id) ON DELETE CASCADE,
        sector_id           BIGINT NOT NULL REFERENCES prize_spin_sector(id),
        participant_nick    TEXT NOT NULL,
        spun_by_user_id     BIGINT NOT NULL REFERENCES users(id),
        is_archived         BOOLEAN NOT NULL DEFAULT false,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_prize_spin_win_history
        ON prize_spin_win (prize_spin_id, created_at DESC)
        WHERE is_archived = false;

      CREATE TABLE prize_spin_widget (
        id                  BIGSERIAL PRIMARY KEY,
        account_id          BIGINT NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
        width               INTEGER NOT NULL DEFAULT 500,
        height              INTEGER NOT NULL DEFAULT 500,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
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

  async getPrimaryMembership(userId: number): Promise<DbMembership | null> {
    const result = await this.pool.query<{
      account_id: string | number;
      ucid: string;
      name: string;
      role: 'owner' | 'moderator';
      subscription_plan: string;
    }>(
      `
        SELECT a.id AS account_id, a.ucid, a.name, am.role, a.subscription_plan
        FROM account_members am
        JOIN accounts a ON a.id = am.account_id
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

    return {
      accountId: toInt(row.account_id),
      ucid: row.ucid,
      name: row.name,
      role: row.role,
      subscriptionPlan: row.subscription_plan,
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
        BONUS_BUY_WIDGET_INSERT_SQL,
        bonusBuyWidgetInsertParams(accountId),
      );

      await client.query(
        PRIZE_SPIN_WIDGET_INSERT_SQL,
        prizeSpinWidgetInsertParams(accountId),
      );

      await client.query('COMMIT');

      return {
        userId,
        membership: {
          accountId,
          ucid: accountUcid,
          name: accountName,
          role: 'owner',
          subscriptionPlan: 'free',
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

  async listAccountMembers(accountId: number): Promise<DbAccountMember[]> {
    const result = await this.pool.query<{
      user_id: string | number;
      name: string;
      role: 'owner' | 'moderator';
      is_active: boolean;
      has_invite_link: boolean;
    }>(
      `
        SELECT
          u.id AS user_id,
          u.name,
          am.role,
          am.is_active,
          EXISTS (
            SELECT 1
            FROM auth_credentials ac
            WHERE ac.user_id = u.id
              AND ac.provider = 'access_link'
              AND ac.is_active = true
          ) AS has_invite_link
        FROM account_members am
        JOIN users u ON u.id = am.user_id
        WHERE am.account_id = $1
        ORDER BY CASE WHEN am.role = 'owner' THEN 0 ELSE 1 END, u.name
      `,
      [accountId],
    );

    return result.rows.map((row) => ({
      userId: toInt(row.user_id),
      name: row.name,
      role: row.role,
      isActive: row.is_active,
      hasInviteLink: row.has_invite_link,
    }));
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

  async getBonusBuyById(
    accountId: number,
    bonusBuyId: number,
  ): Promise<DbBonusBuy | null> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      start_balance: string;
      is_active: boolean;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          bb.id,
          bb.account_id,
          bb.title,
          bb.start_balance::text AS start_balance,
          bb.is_active,
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
    if (!row) {
      return null;
    }

    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      title: row.title,
      startBalance: row.start_balance,
      isActive: row.is_active,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    };
  }

  async listBonusBuys(accountId: number): Promise<DbBonusBuy[]> {
    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      start_balance: string;
      is_active: boolean;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        SELECT
          bb.id,
          bb.account_id,
          bb.title,
          bb.start_balance::text AS start_balance,
          bb.is_active,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
        FROM bonus_buy bb
        JOIN users u ON u.id = bb.created_by_user_id
        WHERE bb.account_id = $1
        ORDER BY bb.created_at DESC
      `,
      [accountId],
    );

    return result.rows.map((row) => ({
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      title: row.title,
      startBalance: row.start_balance,
      isActive: row.is_active,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    }));
  }

  async createBonusBuy(
    accountId: number,
    createdByUserId: number,
    title: string,
    startBalance: string,
  ): Promise<DbBonusBuy> {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(startBalance)) {
      throw new Error('INVALID_START_BALANCE');
    }

    const balanceValue = Number.parseFloat(startBalance);
    if (!Number.isFinite(balanceValue) || balanceValue < 0) {
      throw new Error('INVALID_START_BALANCE');
    }

    const normalizedBalance = balanceValue.toFixed(2);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query<{
        id: string | number;
        account_id: string | number;
        title: string;
        start_balance: string;
        is_active: boolean;
        created_at: Date;
        created_by_user_id: string | number;
        created_by_name: string;
      }>(
        `
          INSERT INTO bonus_buy (
            account_id, created_by_user_id, title, start_balance
          )
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            account_id,
            title,
            start_balance::text AS start_balance,
            is_active,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [accountId, createdByUserId, trimmedTitle, normalizedBalance],
      );

      const row = result.rows[0];
      const bonusBuyId = toInt(row.id);

      await client.query(
        BONUS_BUY_WIDGET_INSERT_SQL,
        bonusBuyWidgetInsertParams(accountId),
      );

      await client.query('COMMIT');

      return {
        id: bonusBuyId,
        accountId: toInt(row.account_id),
        title: row.title,
        startBalance: row.start_balance,
        isActive: row.is_active,
        createdAt: row.created_at,
        createdByUserId: toInt(row.created_by_user_id),
        createdByName: row.created_by_name,
      };
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
      title: string;
      start_balance: string;
      is_active: boolean;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        UPDATE bonus_buy bb
        SET is_active = false
        FROM users u
        WHERE bb.created_by_user_id = u.id
          AND bb.account_id = $1
          AND bb.id = $2
          AND bb.is_active = true
        RETURNING
          bb.id,
          bb.account_id,
          bb.title,
          bb.start_balance::text AS start_balance,
          bb.is_active,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
      `,
      [accountId, bonusBuyId],
    );

    const row = result.rows[0];
    if (row) {
      return {
        id: toInt(row.id),
        accountId: toInt(row.account_id),
        title: row.title,
        startBalance: row.start_balance,
        isActive: row.is_active,
        createdAt: row.created_at,
        createdByUserId: toInt(row.created_by_user_id),
        createdByName: row.created_by_name,
      };
    }

    const existing = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }
    if (!existing.isActive) {
      throw new Error('ALREADY_ENDED');
    }

    throw new Error('NOT_FOUND');
  }

  async updateBonusBuy(
    accountId: number,
    bonusBuyId: number,
    updates: { title?: string; startBalance?: string },
  ): Promise<DbBonusBuy> {
    const existing = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    const nextTitle =
      updates.title !== undefined ? updates.title.trim() : existing.title;
    if (nextTitle.length === 0 || nextTitle.length > 200) {
      throw new Error('INVALID_TITLE');
    }

    const nextBalance =
      updates.startBalance !== undefined
        ? normalizePositiveMoney(updates.startBalance)
        : existing.startBalance;

    const result = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      start_balance: string;
      is_active: boolean;
      created_at: Date;
      created_by_user_id: string | number;
      created_by_name: string;
    }>(
      `
        UPDATE bonus_buy bb
        SET title = $3, start_balance = $4
        FROM users u
        WHERE bb.created_by_user_id = u.id
          AND bb.account_id = $1
          AND bb.id = $2
        RETURNING
          bb.id,
          bb.account_id,
          bb.title,
          bb.start_balance::text AS start_balance,
          bb.is_active,
          bb.created_at,
          bb.created_by_user_id,
          u.name AS created_by_name
      `,
      [accountId, bonusBuyId, nextTitle, nextBalance],
    );

    const row = result.rows[0];
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      title: row.title,
      startBalance: row.start_balance,
      isActive: row.is_active,
      createdAt: row.created_at,
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
    };
  }

  private mapBonusBuySlotRow(row: {
    id: string | number;
    bonus_buy_id: string | number;
    created_by_user_id: string | number;
    created_by_name: string;
    slot_name: string;
    nick_provider: string | null;
    purchase_amount: string;
    win_amount: string | null;
    multiplier: string | null;
    is_now_playing: boolean;
    created_at: Date;
  }): DbBonusBuySlot {
    return {
      id: toInt(row.id),
      bonusBuyId: toInt(row.bonus_buy_id),
      createdByUserId: toInt(row.created_by_user_id),
      createdByName: row.created_by_name,
      slotName: row.slot_name,
      nickProvider: row.nick_provider,
      purchaseAmount: row.purchase_amount,
      winAmount: row.win_amount,
      multiplier: row.multiplier,
      isNowPlaying: row.is_now_playing,
      createdAt: row.created_at,
    };
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
      slot_name: string;
      nick_provider: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      is_now_playing: boolean;
      created_at: Date;
    }>(
      `
        SELECT
          s.id,
          s.bonus_buy_id,
          s.created_by_user_id,
          u.name AS created_by_name,
          s.slot_name,
          s.nick_provider,
          s.purchase_amount::text AS purchase_amount,
          s.win_amount::text AS win_amount,
          s.multiplier::text AS multiplier,
          s.is_now_playing,
          s.created_at
        FROM bonus_buy_slot s
        JOIN users u ON u.id = s.created_by_user_id
        WHERE s.bonus_buy_id = $1
          AND s.is_archived = false
        ORDER BY s.created_at ASC
      `,
      [bonusBuyId],
    );

    return result.rows.map((row) => this.mapBonusBuySlotRow(row));
  }

  async createBonusBuySlot(
    accountId: number,
    bonusBuyId: number,
    createdByUserId: number,
    slotName: string,
    nickProvider: string | null,
    purchaseAmount: string,
  ): Promise<DbBonusBuySlot> {
    const session = await this.getBonusBuyById(accountId, bonusBuyId);
    if (!session) {
      throw new Error('NOT_FOUND');
    }

    const trimmedSlot = slotName.trim();
    if (trimmedSlot.length === 0 || trimmedSlot.length > 200) {
      throw new Error('INVALID_SLOT_NAME');
    }

    const normalizedPurchase = normalizePositiveMoney(purchaseAmount);
    const trimmedNick = nickProvider?.trim() ?? '';
    const nickValue = trimmedNick.length > 0 ? trimmedNick : null;

    const result = await this.pool.query<{
      id: string | number;
      bonus_buy_id: string | number;
      created_by_user_id: string | number;
      created_by_name: string;
      slot_name: string;
      nick_provider: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      is_now_playing: boolean;
      created_at: Date;
    }>(
      `
        INSERT INTO bonus_buy_slot (
          bonus_buy_id,
          created_by_user_id,
          slot_name,
          nick_provider,
          purchase_amount
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          bonus_buy_id,
          created_by_user_id,
          (SELECT name FROM users WHERE id = $2) AS created_by_name,
          slot_name,
          nick_provider,
          purchase_amount::text AS purchase_amount,
          win_amount::text AS win_amount,
          multiplier::text AS multiplier,
          is_now_playing,
          created_at
      `,
      [bonusBuyId, createdByUserId, trimmedSlot, nickValue, normalizedPurchase],
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
        slot_name: string;
        nick_provider: string | null;
        purchase_amount: string;
        win_amount: string | null;
        multiplier: string | null;
        is_now_playing: boolean;
        is_archived: boolean;
      }>(
        `
          SELECT
            s.id,
            s.bonus_buy_id,
            s.slot_name,
            s.nick_provider,
            s.purchase_amount::text AS purchase_amount,
            s.win_amount::text AS win_amount,
            s.multiplier::text AS multiplier,
            s.is_now_playing,
            s.is_archived
          FROM bonus_buy_slot s
          JOIN bonus_buy bb ON bb.id = s.bonus_buy_id
          WHERE bb.account_id = $1
            AND s.bonus_buy_id = $2
            AND s.id = $3
        `,
        [accountId, bonusBuyId, slotId],
      );

      const row = existing.rows[0];
      if (!row || row.is_archived) {
        throw new Error('NOT_FOUND');
      }

      let nextSlotName = row.slot_name;
      if (input.slotName !== undefined) {
        const trimmed = input.slotName.trim();
        if (trimmed.length === 0 || trimmed.length > 200) {
          throw new Error('INVALID_SLOT_NAME');
        }
        nextSlotName = trimmed;
      }

      let nextNick = row.nick_provider;
      if (input.nickProvider !== undefined) {
        if (input.nickProvider === null) {
          nextNick = null;
        } else {
          const trimmed = input.nickProvider.trim();
          nextNick = trimmed.length > 0 ? trimmed : null;
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
            : normalizeSignedMoney(input.winAmount);
      }

      let nextMultiplier: string | null = row.multiplier;
      if (nextWin === null) {
        nextMultiplier = null;
      } else {
        nextMultiplier = computeMultiplier(nextWin, nextPurchase);
      }

      let nextPlaying = row.is_now_playing;
      if (input.isNowPlaying !== undefined) {
        nextPlaying = input.isNowPlaying;
      }

      if (nextPlaying) {
        await client.query(
          `
            UPDATE bonus_buy_slot
            SET is_now_playing = false
            WHERE bonus_buy_id = $1
              AND id != $2
              AND is_archived = false
          `,
          [bonusBuyId, slotId],
        );
      }

      const updated = await client.query<{
        id: string | number;
        bonus_buy_id: string | number;
        created_by_user_id: string | number;
        created_by_name: string;
        slot_name: string;
        nick_provider: string | null;
        purchase_amount: string;
        win_amount: string | null;
        multiplier: string | null;
        is_now_playing: boolean;
        created_at: Date;
      }>(
        `
          UPDATE bonus_buy_slot s
          SET
            slot_name = $3,
            nick_provider = $4,
            purchase_amount = $5,
            win_amount = $6,
            multiplier = $7,
            is_now_playing = $8
          FROM users u
          WHERE s.created_by_user_id = u.id
            AND s.id = $1
            AND s.bonus_buy_id = $2
          RETURNING
            s.id,
            s.bonus_buy_id,
            s.created_by_user_id,
            u.name AS created_by_name,
            s.slot_name,
            s.nick_provider,
            s.purchase_amount::text AS purchase_amount,
            s.win_amount::text AS win_amount,
            s.multiplier::text AS multiplier,
            s.is_now_playing,
            s.created_at
        `,
        [
          slotId,
          bonusBuyId,
          nextSlotName,
          nextNick,
          nextPurchase,
          nextWin,
          nextMultiplier,
          nextPlaying,
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

  private assertWidgetHexColor(value: string, field: string): string {
    const trimmed = value.trim();
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
      throw new Error(`INVALID_WIDGET_COLOR:${field}`);
    }
    return trimmed;
  }

  private async ensureAccountBonusBuyWidget(
    accountId: number,
  ): Promise<DbBonusBuyWidget> {
    await this.pool.query(
      BONUS_BUY_WIDGET_INSERT_SQL,
      bonusBuyWidgetInsertParams(accountId),
    );

    const result = await this.pool.query(
      `
        SELECT ${this.widgetSelectColumns()}
        FROM bonus_buy_widget w
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

  private mapBonusBuyWidgetRow(row: {
    id: string | number;
    account_id: string | number;
    width: string | number;
    height: string | number;
    background_color: string;
    surface_color: string;
    border_color: string;
    accent_color: string;
    positive_color: string;
    negative_color: string;
    live_color: string;
    text_muted_color: string;
    border_radius: string | number;
    padding: string | number;
    font_family: string;
    created_at: Date;
    updated_at: Date;
  }): DbBonusBuyWidget {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      width: toInt(row.width),
      height: toInt(row.height),
      backgroundColor: row.background_color,
      surfaceColor: row.surface_color,
      borderColor: row.border_color,
      accentColor: row.accent_color,
      positiveColor: row.positive_color,
      negativeColor: row.negative_color,
      liveColor: row.live_color,
      textMutedColor: row.text_muted_color,
      borderRadius: toInt(row.border_radius),
      padding: toInt(row.padding),
      fontFamily: row.font_family,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private widgetSelectColumns(): string {
    return `
      w.id,
      w.account_id,
      w.width,
      w.height,
      w.background_color,
      w.surface_color,
      w.border_color,
      w.accent_color,
      w.positive_color,
      w.negative_color,
      w.live_color,
      w.text_muted_color,
      w.border_radius,
      w.padding,
      w.font_family,
      w.created_at,
      w.updated_at
    `;
  }

  async getBonusBuyWidget(accountId: number): Promise<DbBonusBuyWidget> {
    return this.ensureAccountBonusBuyWidget(accountId);
  }

  async patchBonusBuyWidget(
    accountId: number,
    input: PatchBonusBuyWidgetInput,
  ): Promise<DbBonusBuyWidget> {
    const existing = await this.ensureAccountBonusBuyWidget(accountId);

    const next = {
      width:
        input.width !== undefined
          ? this.clampWidgetDimension(input.width)
          : existing.width,
      height:
        input.height !== undefined
          ? this.clampWidgetDimension(input.height)
          : existing.height,
      backgroundColor:
        input.backgroundColor !== undefined
          ? this.assertWidgetHexColor(input.backgroundColor, 'background_color')
          : existing.backgroundColor,
      surfaceColor:
        input.surfaceColor !== undefined
          ? this.assertWidgetHexColor(input.surfaceColor, 'surface_color')
          : existing.surfaceColor,
      borderColor:
        input.borderColor !== undefined
          ? this.assertWidgetHexColor(input.borderColor, 'border_color')
          : existing.borderColor,
      accentColor:
        input.accentColor !== undefined
          ? this.assertWidgetHexColor(input.accentColor, 'accent_color')
          : existing.accentColor,
      positiveColor:
        input.positiveColor !== undefined
          ? this.assertWidgetHexColor(input.positiveColor, 'positive_color')
          : existing.positiveColor,
      negativeColor:
        input.negativeColor !== undefined
          ? this.assertWidgetHexColor(input.negativeColor, 'negative_color')
          : existing.negativeColor,
      liveColor:
        input.liveColor !== undefined
          ? this.assertWidgetHexColor(input.liveColor, 'live_color')
          : existing.liveColor,
      textMutedColor:
        input.textMutedColor !== undefined
          ? this.assertWidgetHexColor(input.textMutedColor, 'text_muted_color')
          : existing.textMutedColor,
      borderRadius:
        input.borderRadius !== undefined
          ? Math.min(100, Math.max(0, Math.trunc(input.borderRadius)))
          : existing.borderRadius,
      padding:
        input.padding !== undefined
          ? Math.min(100, Math.max(0, Math.trunc(input.padding)))
          : existing.padding,
      fontFamily:
        input.fontFamily !== undefined
          ? input.fontFamily.trim()
          : existing.fontFamily,
    };

    if (next.fontFamily.length === 0 || next.fontFamily.length > 200) {
      throw new Error('INVALID_WIDGET_FONT_FAMILY');
    }

    const result = await this.pool.query(
      `
        UPDATE bonus_buy_widget w
        SET
          width = $2,
          height = $3,
          background_color = $4,
          surface_color = $5,
          border_color = $6,
          accent_color = $7,
          positive_color = $8,
          negative_color = $9,
          live_color = $10,
          text_muted_color = $11,
          border_radius = $12,
          padding = $13,
          font_family = $14,
          updated_at = now()
        WHERE w.account_id = $1
        RETURNING ${this.widgetSelectColumns()}
      `,
      [
        accountId,
        next.width,
        next.height,
        next.backgroundColor,
        next.surfaceColor,
        next.borderColor,
        next.accentColor,
        next.positiveColor,
        next.negativeColor,
        next.liveColor,
        next.textMutedColor,
        next.borderRadius,
        next.padding,
        next.fontFamily,
      ],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapBonusBuyWidgetRow(row);
  }

  async getPublicBonusBuyWidgetView(bonusBuyId: number): Promise<{
    record: DbPublicBonusBuyRecord;
    slots: DbBonusBuySlot[];
    settings: DbBonusBuyWidget;
  } | null> {
    const recordResult = await this.pool.query<{
      id: string | number;
      account_id: string | number;
      title: string;
      start_balance: string;
      is_active: boolean;
    }>(
      `
        SELECT id, account_id, title, start_balance::text AS start_balance, is_active
        FROM bonus_buy
        WHERE id = $1
      `,
      [bonusBuyId],
    );

    const recordRow = recordResult.rows[0];
    if (!recordRow) {
      return null;
    }

    const accountId = toInt(recordRow.account_id);
    const settings = await this.ensureAccountBonusBuyWidget(accountId);

    const slotsResult = await this.pool.query<{
      id: string | number;
      bonus_buy_id: string | number;
      created_by_user_id: string | number;
      created_by_name: string;
      slot_name: string;
      nick_provider: string | null;
      purchase_amount: string;
      win_amount: string | null;
      multiplier: string | null;
      is_now_playing: boolean;
      created_at: Date;
    }>(
      `
        SELECT
          s.id,
          s.bonus_buy_id,
          s.created_by_user_id,
          u.name AS created_by_name,
          s.slot_name,
          s.nick_provider,
          s.purchase_amount::text AS purchase_amount,
          s.win_amount::text AS win_amount,
          s.multiplier::text AS multiplier,
          s.is_now_playing,
          s.created_at
        FROM bonus_buy_slot s
        JOIN users u ON u.id = s.created_by_user_id
        WHERE s.bonus_buy_id = $1
          AND s.is_archived = false
        ORDER BY s.created_at ASC
      `,
      [bonusBuyId],
    );

    return {
      record: {
        id: toInt(recordRow.id),
        title: recordRow.title,
        startBalance: recordRow.start_balance,
        isActive: recordRow.is_active,
      },
      slots: slotsResult.rows.map((row) => this.mapBonusBuySlotRow(row)),
      settings,
    };
  }

  async archiveBonusBuySlot(
    accountId: number,
    bonusBuyId: number,
    slotId: number,
  ): Promise<void> {
    const result = await this.pool.query(
      `
        UPDATE bonus_buy_slot s
        SET is_archived = true, is_now_playing = false
        FROM bonus_buy bb
        WHERE s.bonus_buy_id = bb.id
          AND bb.account_id = $1
          AND s.bonus_buy_id = $2
          AND s.id = $3
          AND s.is_archived = false
      `,
      [accountId, bonusBuyId, slotId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }
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
          INSERT INTO prize_spin (account_id, created_by_user_id, title)
          VALUES ($1, $2, $3)
          RETURNING
            id,
            account_id,
            title,
            status,
            created_at,
            created_by_user_id,
            (SELECT name FROM users WHERE id = $2) AS created_by_name
        `,
        [accountId, createdByUserId, trimmedTitle],
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

  async getActivePrizeSpinId(accountId: number): Promise<number | null> {
    const result = await this.pool.query<{ id: string | number }>(
      `
        SELECT id
        FROM prize_spin
        WHERE account_id = $1
          AND status = 'live'
        LIMIT 1
      `,
      [accountId],
    );

    const row = result.rows[0];
    return row ? toInt(row.id) : null;
  }

  async goLivePrizeSpin(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpin> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `
          UPDATE prize_spin
          SET status = 'off_air'
          WHERE account_id = $1
            AND status = 'live'
        `,
        [accountId],
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
          UPDATE prize_spin ps
          SET status = 'live'
          FROM users u
          WHERE ps.created_by_user_id = u.id
            AND ps.account_id = $1
            AND ps.id = $2
            AND ps.status != 'archived'
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

      await client.query('COMMIT');

      const row = result.rows[0];
      if (!row) {
        throw new Error('NOT_FOUND');
      }

      return this.mapPrizeSpinRow(row);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deactivatePrizeSpin(
    accountId: number,
    prizeSpinId: number,
  ): Promise<DbPrizeSpin> {
    await this.requireMutablePrizeSpin(accountId, prizeSpinId);

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
        UPDATE prize_spin ps
        SET status = 'off_air'
        FROM users u
        WHERE ps.created_by_user_id = u.id
          AND ps.account_id = $1
          AND ps.id = $2
          AND ps.status != 'archived'
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

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapPrizeSpinRow(row);
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
          AND status IN ('live', 'off_air')
      `,
      [accountId, prizeSpinId],
    );

    if (result.rowCount === 0) {
      throw new Error('NOT_FOUND');
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
    created_at: Date;
    updated_at: Date;
  }): DbPrizeSpinWidget {
    return {
      id: toInt(row.id),
      accountId: toInt(row.account_id),
      width: toInt(row.width),
      height: toInt(row.height),
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

    return this.mapPrizeSpinWidgetRow(row);
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
    };

    const result = await this.pool.query(
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
          w.created_at,
          w.updated_at
      `,
      [accountId, next.width, next.height],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('NOT_FOUND');
    }

    return this.mapPrizeSpinWidgetRow(row);
  }

  async getPublicPrizeSpinWidgetViewByUcid(
    ucid: string,
  ): Promise<
    | {
        record: DbPrizeSpin;
        sectors: DbPrizeSpinSector[];
        latestWin: DbPrizeSpinWin | null;
        settings: DbPrizeSpinWidget;
      }
    | 'NOT_FOUND'
    | 'NOT_LIVE'
  > {
    const accountId = await this.getAccountIdByUcid(ucid);
    if (accountId === null) {
      return 'NOT_FOUND';
    }

    const prizeSpinId = await this.getActivePrizeSpinId(accountId);
    if (prizeSpinId === null) {
      return 'NOT_LIVE';
    }

    const view = await this.getPublicPrizeSpinWidgetView(prizeSpinId);
    if (!view || view.record.status !== 'live') {
      return 'NOT_LIVE';
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
          AND ps.status = 'live'
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
}
