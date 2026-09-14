import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import type { KickProfile } from '../auth/auth.types.js';
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
  name: string;
  role: 'owner' | 'admin';
  subscriptionPlan: string;
};

export type DbAccountMember = {
  userId: number;
  name: string;
  role: 'owner' | 'admin';
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
        name              TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
        subscription_plan TEXT NOT NULL DEFAULT 'free',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE account_members (
        id          BIGSERIAL PRIMARY KEY,
        account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role        TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
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
      name: string;
      role: 'owner' | 'admin';
      subscription_plan: string;
    }>(
      `
        SELECT a.id AS account_id, a.name, am.role, a.subscription_plan
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
      name: row.name,
      role: row.role,
      subscriptionPlan: row.subscription_plan,
    };
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

      const accountResult = await client.query<{ id: number }>(
        `
          INSERT INTO accounts (name, subscription_plan)
          VALUES ($1, 'free')
          RETURNING id
        `,
        [accountName],
      );
      const accountId = toInt(accountResult.rows[0].id);

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

      await client.query('COMMIT');

      return {
        userId,
        membership: {
          accountId,
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
      role: 'owner' | 'admin';
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

  async rotateAdminInviteLink(
    accountId: number,
    ownerUserId: number,
    adminUserId: number,
    appBaseUrl: string,
  ): Promise<{ joinUrl: string }> {
    const isOwner = await this.isAccountOwner(accountId, ownerUserId);
    if (!isOwner) {
      throw new Error('FORBIDDEN');
    }

    const target = await this.pool.query<{
      role: 'owner' | 'admin';
      is_active: boolean;
    }>(
      `
        SELECT role, is_active
        FROM account_members
        WHERE account_id = $1 AND user_id = $2
      `,
      [accountId, adminUserId],
    );

    if (
      !target.rows[0] ||
      target.rows[0].role !== 'admin' ||
      !target.rows[0].is_active
    ) {
      throw new Error('ADMIN_NOT_FOUND');
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
      [tokenHash, adminUserId],
    );

    if (result.rowCount === 0) {
      throw new Error('INVITE_LINK_NOT_FOUND');
    }

    const joinUrl = `${appBaseUrl.replace(/\/$/, '')}/join/${plainToken}`;
    return { joinUrl };
  }

  async createAdminWithAccessLink(
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
      throw new Error('INVALID_ADMIN_NAME');
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
          VALUES ($1, $2, 'admin', true)
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

  async revokeAdminPermanently(
    accountId: number,
    ownerUserId: number,
    adminUserId: number,
  ): Promise<void> {
    const isOwner = await this.isAccountOwner(accountId, ownerUserId);
    if (!isOwner) {
      throw new Error('FORBIDDEN');
    }

    const target = await this.pool.query<{ role: 'owner' | 'admin' }>(
      `
        SELECT role FROM account_members
        WHERE account_id = $1 AND user_id = $2
      `,
      [accountId, adminUserId],
    );

    if (!target.rows[0] || target.rows[0].role !== 'admin') {
      throw new Error('ADMIN_NOT_FOUND');
    }

    await this.pool.query(
      `
        UPDATE auth_credentials
        SET is_active = false, updated_at = now()
        WHERE user_id = $1 AND provider = 'access_link'
      `,
      [adminUserId],
    );

    const result = await this.pool.query(
      `
        UPDATE account_members
        SET is_active = false, updated_at = now()
        WHERE account_id = $1 AND user_id = $2 AND role = 'admin'
      `,
      [accountId, adminUserId],
    );

    if (result.rowCount === 0) {
      throw new Error('ADMIN_NOT_FOUND');
    }
  }
}
