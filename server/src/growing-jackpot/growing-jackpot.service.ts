import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { commandMatchesKeyword } from '../first-reaction/first-reaction-settings.js';
import { DatabaseService } from '../database/database.service.js';
import { initialSessionStatusOnCreate } from '../session-lifecycle/initial-session-status-on-create.js';
import { pickGrowingJackpotWinner } from './growing-jackpot-draw.js';
import {
  computeDisplayPrize,
  mergeGrowingJackpotSettingsPatch,
  parseGrowingJackpotSettings,
  type GrowingJackpotSettings,
} from './growing-jackpot-settings.js';
import { GROWING_JACKPOT_WIDGET_DEFAULTS } from './growing-jackpot-widget-defaults.js';
import {
  buildGrowingJackpotRoundOrderBy,
  type GrowingJackpotRoundSortField,
  type GrowingJackpotRoundSortOrder,
} from './growing-jackpot-round-list.js';
import {
  mergeGrowingJackpotWidgetStylePatch,
  parseGrowingJackpotWidgetStyle,
  type GrowingJackpotWidgetStyle,
} from './growing-jackpot-widget-style.js';

const ROUND_CLOSE_TICK_MS = 10_000;

export type GrowingJackpotStatus = 'live' | 'off_air' | 'archived';

export type GrowingJackpotWidgetRecord = {
  width: number;
  height: number;
  style: GrowingJackpotWidgetStyle;
};

export type GrowingJackpotRecord = {
  id: number;
  accountId: number;
  title: string;
  status: GrowingJackpotStatus;
  settings: GrowingJackpotSettings;
  createdAt: string;
  createdByUserId: number;
  createdByName: string;
};

export type GrowingJackpotRoundRecord = {
  id: number;
  growingJackpotId: number;
  roundIndex: number;
  joinKeyword: string;
  phase: 'accepting' | 'drawing' | 'closed';
  result: string | null;
  endsAt: string;
  participantCount: number;
  displayPrize: number;
  closedAt: string | null;
  winnerProvider: string | null;
  winnerProviderUserId: string | null;
  winnerDisplayName: string | null;
  proofToken: string | null;
  fulfillmentStatus: string;
  startedByUserId: number;
  createdAt: string;
};

@Injectable()
export class GrowingJackpotService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(GrowingJackpotService.name);
  private roundCloseTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly database: DatabaseService) {}

  onModuleInit(): void {
    this.roundCloseTimer = setInterval(() => {
      void this.closeAllDueRounds().catch((error) => {
        this.logger.warn(
          `growing jackpot round close tick failed: ${String(error)}`,
        );
      });
    }, ROUND_CLOSE_TICK_MS);
  }

  onModuleDestroy(): void {
    if (this.roundCloseTimer !== null) {
      clearInterval(this.roundCloseTimer);
      this.roundCloseTimer = null;
    }
  }

  async closeAllDueRounds(): Promise<void> {
    const due = await this.pool().query<{
      id: number;
      growing_jackpot_id: number;
    }>(
      `
        SELECT id, growing_jackpot_id
        FROM growing_jackpot_round
        WHERE phase = 'accepting'
          AND ends_at <= now()
      `,
    );
    for (const row of due.rows) {
      await this.closeRoundById(Number(row.growing_jackpot_id), Number(row.id), {
        drawWinner: true,
      });
    }
  }

  private pool() {
    return this.database.getPool();
  }

  static createProofToken(): string {
    return `WIN-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async requireMember(accountId: number, userId: number): Promise<void> {
    const ok = await this.database.hasActiveMembership(accountId, userId);
    if (!ok) {
      throw new ForbiddenException('Not a member of this account');
    }
  }

  private mapSession(row: Record<string, unknown>): GrowingJackpotRecord {
    return {
      id: Number(row.id),
      accountId: Number(row.account_id),
      title: String(row.title),
      status: row.status as GrowingJackpotStatus,
      settings: parseGrowingJackpotSettings(row.settings),
      createdAt: new Date(row.created_at as Date).toISOString(),
      createdByUserId: Number(row.created_by_user_id),
      createdByName: String(row.created_by_name ?? ''),
    };
  }

  private mapRound(row: Record<string, unknown>): GrowingJackpotRoundRecord {
    return {
      id: Number(row.id),
      growingJackpotId: Number(row.growing_jackpot_id),
      roundIndex: Number(row.round_index),
      joinKeyword: String(row.join_keyword),
      phase: row.phase as GrowingJackpotRoundRecord['phase'],
      result: row.result ? String(row.result) : null,
      endsAt: new Date(row.ends_at as Date).toISOString(),
      participantCount: Number(row.participant_count),
      displayPrize: Number(row.display_prize),
      closedAt: row.closed_at
        ? new Date(row.closed_at as Date).toISOString()
        : null,
      winnerProvider: row.winner_provider ? String(row.winner_provider) : null,
      winnerProviderUserId: row.winner_provider_user_id
        ? String(row.winner_provider_user_id)
        : null,
      winnerDisplayName: row.winner_display_name
        ? String(row.winner_display_name)
        : null,
      proofToken: row.proof_token ? String(row.proof_token) : null,
      fulfillmentStatus: String(row.fulfillment_status),
      startedByUserId: Number(row.started_by_user_id),
      createdAt: new Date(row.created_at as Date).toISOString(),
    };
  }

  private async getSessionRow(
    accountId: number,
    growingJackpotId: number,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.pool().query(
      `
        SELECT gj.*, u.name AS created_by_name
        FROM growing_jackpot gj
        INNER JOIN users u ON u.id = gj.created_by_user_id
        WHERE gj.account_id = $1 AND gj.id = $2
      `,
      [accountId, growingJackpotId],
    );
    return result.rows[0] ?? null;
  }

  async listSessions(
    accountId: number,
    userId: number,
    archived: 'false' | 'true' | 'all',
    page: number,
    limit: number,
  ) {
    await this.requireMember(accountId, userId);

    const whereArchived =
      archived === 'true'
        ? `AND gj.status = 'archived'`
        : archived === 'all'
          ? ''
          : `AND gj.status != 'archived'`;

    const countResult = await this.pool().query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM growing_jackpot gj
        WHERE gj.account_id = $1
        ${whereArchived}
      `,
      [accountId],
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);
    const offset = (page - 1) * limit;

    const result = await this.pool().query(
      `
        SELECT gj.*, u.name AS created_by_name
        FROM growing_jackpot gj
        INNER JOIN users u ON u.id = gj.created_by_user_id
        WHERE gj.account_id = $1
        ${whereArchived}
        ORDER BY gj.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [accountId, limit, offset],
    );
    return {
      sessions: result.rows.map((row) => this.mapSession(row)),
      total,
      page,
      limit,
    };
  }

  private async getActiveRoundRow(
    growingJackpotId: number,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.pool().query(
      `
        SELECT *
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
          AND phase IN ('accepting', 'drawing')
        ORDER BY id DESC
        LIMIT 1
      `,
      [growingJackpotId],
    );
    return result.rows[0] ?? null;
  }

  async getSession(
    accountId: number,
    userId: number,
    growingJackpotId: number,
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, growingJackpotId);
    if (!row) {
      throw new NotFoundException();
    }
    const activeRound =
      row.status === 'archived'
        ? null
        : await this.getActiveRoundRow(growingJackpotId);
    return {
      session: this.mapSession(row),
      activeRound: activeRound ? this.mapRound(activeRound) : null,
    };
  }

  async createSession(accountId: number, userId: number, title: string) {
    await this.requireMember(accountId, userId);
    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 120) {
      throw new BadRequestException('Invalid title');
    }

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1 FROM growing_jackpot
            WHERE account_id = $1 AND status = 'live'
          ) AS has_live
        `,
        [accountId],
      );
      const initialStatus = initialSessionStatusOnCreate(
        liveCheck.rows[0]?.has_live ?? false,
      );

      const inserted = await client.query(
        `
          INSERT INTO growing_jackpot (
            account_id,
            created_by_user_id,
            title,
            status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [accountId, userId, trimmed, initialStatus],
      );
      const id = Number(inserted.rows[0]!.id);
      await client.query(
        `
          INSERT INTO growing_jackpot_widget (account_id)
          VALUES ($1)
          ON CONFLICT (account_id) DO NOTHING
        `,
        [accountId],
      );
      await client.query('COMMIT');
      return this.getSession(accountId, userId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async patchSession(
    accountId: number,
    userId: number,
    growingJackpotId: number,
    patch: Record<string, unknown>,
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, growingJackpotId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
    const current = this.mapSession(row);
    const nextSettings = patch.settings
      ? mergeGrowingJackpotSettingsPatch(
          current.settings,
          patch.settings as Record<string, unknown>,
        )
      : current.settings;

    const fields: string[] = ['updated_at = now()'];
    const values: unknown[] = [];
    let idx = 1;

    if (typeof patch.title === 'string') {
      const title = patch.title.trim();
      if (title.length < 1 || title.length > 120) {
        throw new BadRequestException('Invalid title');
      }
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (patch.settings) {
      fields.push(`settings = $${idx++}::jsonb`);
      values.push(JSON.stringify(nextSettings));
    }

    values.push(accountId, growingJackpotId);
    await this.pool().query(
      `
        UPDATE growing_jackpot
        SET ${fields.join(', ')}
        WHERE account_id = $${idx++} AND id = $${idx}
      `,
      values,
    );
    return this.getSession(accountId, userId, growingJackpotId);
  }

  async archiveSession(
    accountId: number,
    userId: number,
    growingJackpotId: number,
  ) {
    await this.requireMember(accountId, userId);
    await this.pool().query(
      `
        UPDATE growing_jackpot
        SET status = 'archived', updated_at = now()
        WHERE account_id = $1 AND id = $2 AND status != 'archived'
      `,
      [accountId, growingJackpotId],
    );
  }

  async goLive(accountId: number, userId: number, growingJackpotId: number) {
    await this.requireMember(accountId, userId);
    const result = await this.pool().query(
      `
        UPDATE growing_jackpot
        SET status = 'live', updated_at = now()
        WHERE account_id = $1 AND id = $2 AND status = 'off_air'
      `,
      [accountId, growingJackpotId],
    );
    if (result.rowCount === 0) {
      throw new BadRequestException('Cannot go live');
    }
    return this.getSession(accountId, userId, growingJackpotId);
  }

  async deactivate(accountId: number, userId: number, growingJackpotId: number) {
    await this.requireMember(accountId, userId);
    const result = await this.pool().query(
      `
        UPDATE growing_jackpot
        SET status = 'off_air', updated_at = now()
        WHERE account_id = $1 AND id = $2 AND status = 'live'
      `,
      [accountId, growingJackpotId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
    return this.getSession(accountId, userId, growingJackpotId);
  }

  private async assertMutableSession(
    accountId: number,
    growingJackpotId: number,
  ): Promise<void> {
    const row = await this.getSessionRow(accountId, growingJackpotId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
  }

  async listRounds(
    accountId: number,
    userId: number,
    growingJackpotId: number,
    page: number,
    limit: number,
    sortBy: GrowingJackpotRoundSortField,
    sortOrder: GrowingJackpotRoundSortOrder,
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, growingJackpotId);
    if (!row) {
      throw new NotFoundException();
    }

    const countResult = await this.pool().query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
          AND is_archived = false
      `,
      [growingJackpotId],
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);
    const maxPage = Math.max(1, Math.ceil(total / limit) || 1);
    const resolvedPage = Math.min(Math.max(1, page), maxPage);
    const offset = (resolvedPage - 1) * limit;
    const orderBy = buildGrowingJackpotRoundOrderBy(sortBy, sortOrder);

    const rounds = await this.pool().query(
      `
        SELECT *
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
          AND is_archived = false
        ORDER BY ${orderBy}
        LIMIT $2 OFFSET $3
      `,
      [growingJackpotId, limit, offset],
    );

    return {
      rounds: rounds.rows.map((r) => this.mapRound(r)),
      total,
      page: resolvedPage,
      limit,
      sortBy,
      sortOrder,
    };
  }

  async archiveRound(
    accountId: number,
    userId: number,
    growingJackpotId: number,
    roundId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    await this.assertMutableSession(accountId, growingJackpotId);

    const result = await this.pool().query(
      `
        UPDATE growing_jackpot_round r
        SET is_archived = true
        FROM growing_jackpot gj
        WHERE r.growing_jackpot_id = gj.id
          AND gj.account_id = $1
          AND r.growing_jackpot_id = $2
          AND r.id = $3
          AND r.is_archived = false
          AND r.phase = 'closed'
      `,
      [accountId, growingJackpotId, roundId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }

  async archiveAllRounds(
    accountId: number,
    userId: number,
    growingJackpotId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    await this.assertMutableSession(accountId, growingJackpotId);

    await this.pool().query(
      `
        UPDATE growing_jackpot_round r
        SET is_archived = true
        FROM growing_jackpot gj
        WHERE r.growing_jackpot_id = gj.id
          AND gj.account_id = $1
          AND r.growing_jackpot_id = $2
          AND r.is_archived = false
          AND r.phase = 'closed'
      `,
      [accountId, growingJackpotId],
    );
  }

  private async assertCanStartRound(
    client: PoolClient,
    session: GrowingJackpotRecord,
  ): Promise<void> {
    if (session.status !== 'live') {
      throw new BadRequestException('Session is not live');
    }
    const active = await client.query(
      `
        SELECT id FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
          AND phase IN ('accepting', 'drawing')
        LIMIT 1
      `,
      [session.id],
    );
    if (active.rows.length > 0) {
      throw new BadRequestException('Round already in progress');
    }
  }

  async startRound(
    accountId: number,
    userId: number,
    growingJackpotId: number,
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, growingJackpotId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
    const session = this.mapSession(row);
    const settings = session.settings;

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      await this.assertCanStartRound(client, session);

      const countResult = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM growing_jackpot_round WHERE growing_jackpot_id = $1`,
        [growingJackpotId],
      );
      const roundIndex =
        Number.parseInt(countResult.rows[0]?.count ?? '0', 10) + 1;

      const displayPrize = computeDisplayPrize(settings, 0);

      const inserted = await client.query(
        `
          INSERT INTO growing_jackpot_round (
            growing_jackpot_id,
            round_index,
            join_keyword,
            settings_snapshot,
            phase,
            ends_at,
            participant_count,
            display_prize,
            fulfillment_status,
            started_by_user_id
          )
          VALUES (
            $1, $2, $3, $4::jsonb, 'accepting',
            now() + ($5::int * interval '1 second'),
            0, $6, 'pending', $7
          )
          RETURNING *
        `,
        [
          growingJackpotId,
          roundIndex,
          settings.joinKeyword,
          JSON.stringify(settings),
          settings.timerSeconds,
          displayPrize,
          userId,
        ],
      );

      await client.query('COMMIT');
      return { round: this.mapRound(inserted.rows[0]!) };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async stopRound(
    accountId: number,
    userId: number,
    growingJackpotId: number,
    roundId: number,
  ) {
    await this.requireMember(accountId, userId);
    await this.closeRoundById(growingJackpotId, roundId, {
      result: 'stopped',
      stoppedByUserId: userId,
      drawWinner: true,
    });
    const round = await this.getRoundRow(growingJackpotId, roundId);
    if (!round) {
      throw new NotFoundException();
    }
    return { round: this.mapRound(round) };
  }

  private async getRoundRow(
    growingJackpotId: number,
    roundId: number,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.pool().query(
      `
        SELECT *
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1 AND id = $2
      `,
      [growingJackpotId, roundId],
    );
    return result.rows[0] ?? null;
  }

  async getIntakeContext(accountId: number): Promise<{
    growingJackpotId: number;
    roundId: number;
    joinKeyword: string;
    settings: GrowingJackpotSettings;
  } | null> {
    const live = await this.pool().query(
      `
        SELECT id FROM growing_jackpot
        WHERE account_id = $1 AND status = 'live'
        ORDER BY id DESC
        LIMIT 1
      `,
      [accountId],
    );
    const growingJackpotId = live.rows[0]?.id;
    if (!growingJackpotId) {
      return null;
    }

    await this.closeDueRoundsForJackpot(Number(growingJackpotId));

    const round = await this.pool().query(
      `
        SELECT id, join_keyword, settings_snapshot
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1 AND phase = 'accepting'
        ORDER BY id DESC
        LIMIT 1
      `,
      [growingJackpotId],
    );
    const row = round.rows[0];
    if (!row) {
      return null;
    }

    return {
      growingJackpotId: Number(growingJackpotId),
      roundId: Number(row.id),
      joinKeyword: String(row.join_keyword),
      settings: parseGrowingJackpotSettings(row.settings_snapshot),
    };
  }

  async tryJoinFromChat(input: {
    accountId: number;
    roundId: number;
    growingJackpotId: number;
    provider: 'kick';
    providerUserId: string;
    displayName: string;
    roleIds: string[];
  }): Promise<
    | { status: 'created'; participantCount: number; displayPrize: number }
    | { status: 'duplicate' }
    | { status: 'not_accepting' }
  > {
    await this.closeDueRoundsForJackpot(input.growingJackpotId);

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');

      const roundResult = await client.query(
        `
          SELECT id, phase, settings_snapshot, participant_count
          FROM growing_jackpot_round
          WHERE id = $1 AND growing_jackpot_id = $2
          FOR UPDATE
        `,
        [input.roundId, input.growingJackpotId],
      );
      const round = roundResult.rows[0];
      if (!round || round.phase !== 'accepting') {
        await client.query('ROLLBACK');
        return { status: 'not_accepting' };
      }

      const insert = await client.query(
        `
          INSERT INTO growing_jackpot_participant (
            round_id,
            provider,
            provider_user_id,
            display_name,
            role_ids
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (round_id, provider, provider_user_id) DO NOTHING
          RETURNING id
        `,
        [
          input.roundId,
          input.provider,
          input.providerUserId,
          input.displayName,
          input.roleIds,
        ],
      );

      if (!insert.rows[0]) {
        await client.query('COMMIT');
        return { status: 'duplicate' };
      }

      const settings = parseGrowingJackpotSettings(round.settings_snapshot);
      const newCount = Number(round.participant_count) + 1;
      const displayPrize = computeDisplayPrize(settings, newCount);

      await client.query(
        `
          UPDATE growing_jackpot_round
          SET participant_count = $1, display_prize = $2
          WHERE id = $3
        `,
        [newCount, displayPrize, input.roundId],
      );

      await client.query('COMMIT');
      return {
        status: 'created',
        participantCount: newCount,
        displayPrize,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async closeDueRoundsForJackpot(growingJackpotId: number): Promise<void> {
    const due = await this.pool().query<{ id: number }>(
      `
        SELECT id
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
          AND phase = 'accepting'
          AND ends_at <= now()
      `,
      [growingJackpotId],
    );

    for (const row of due.rows) {
      await this.closeRoundById(growingJackpotId, Number(row.id), {
        drawWinner: true,
      });
    }
  }

  private async closeRoundById(
    growingJackpotId: number,
    roundId: number,
    options: {
      result?: 'stopped';
      stoppedByUserId?: number;
      drawWinner: boolean;
    },
  ): Promise<void> {
    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');

      const roundResult = await client.query(
        `
          SELECT *
          FROM growing_jackpot_round
          WHERE id = $1 AND growing_jackpot_id = $2
          FOR UPDATE
        `,
        [roundId, growingJackpotId],
      );
      const round = roundResult.rows[0];
      if (!round || round.phase === 'closed') {
        await client.query('COMMIT');
        return;
      }

      if (round.phase === 'accepting') {
        await client.query(
          `UPDATE growing_jackpot_round SET phase = 'drawing' WHERE id = $1`,
          [roundId],
        );
      }

      const settings = parseGrowingJackpotSettings(round.settings_snapshot);
      const count = Number(round.participant_count);

      if (options.result === 'stopped') {
        await client.query(
          `
            UPDATE growing_jackpot_round
            SET
              phase = 'closed',
              result = 'stopped',
              closed_at = now(),
              fulfillment_status = 'not_applicable',
              stopped_by_user_id = $2
            WHERE id = $1
          `,
          [roundId, options.stoppedByUserId ?? null],
        );
        await client.query('COMMIT');
        return;
      }

      if (count === 0) {
        await client.query(
          `
            UPDATE growing_jackpot_round
            SET
              phase = 'closed',
              result = 'no_participants',
              closed_at = now(),
              fulfillment_status = 'not_applicable'
            WHERE id = $1
          `,
          [roundId],
        );
        await client.query('COMMIT');
        return;
      }

      if (!options.drawWinner) {
        await client.query('COMMIT');
        return;
      }

      const participants = await client.query(
        `
          SELECT id, role_ids
          FROM growing_jackpot_participant
          WHERE round_id = $1
          ORDER BY id ASC
        `,
        [roundId],
      );

      const picked = pickGrowingJackpotWinner(
        participants.rows.map((p) => ({
          id: Number(p.id),
          roleIds: (p.role_ids as string[]) ?? [],
        })),
        settings.roleSettings,
        settings.weightCombineMode,
      );

      if (!picked) {
        await client.query(
          `
            UPDATE growing_jackpot_round
            SET
              phase = 'closed',
              result = 'no_participants',
              closed_at = now(),
              fulfillment_status = 'not_applicable'
            WHERE id = $1
          `,
          [roundId],
        );
        await client.query('COMMIT');
        return;
      }

      const winnerRow = participants.rows.find(
        (p) => Number(p.id) === picked.winner.id,
      );
      const proofToken = GrowingJackpotService.createProofToken();

      await client.query(
        `
          UPDATE growing_jackpot_round
          SET
            phase = 'closed',
            result = 'won',
            closed_at = now(),
            winner_participant_id = $2,
            winner_provider = 'kick',
            winner_provider_user_id = (
              SELECT provider_user_id FROM growing_jackpot_participant WHERE id = $2
            ),
            winner_display_name = (
              SELECT display_name FROM growing_jackpot_participant WHERE id = $2
            ),
            rng_seed = $3,
            proof_token = $4,
            fulfillment_status = 'pending'
          WHERE id = $1
        `,
        [roundId, picked.winner.id, picked.seed, proofToken],
      );

      await client.query('COMMIT');

      if (settings.announceWinnerInChat && winnerRow) {
        this.logger.log(
          `growing jackpot round ${roundId} won by participant ${picked.winner.id} proof=${proofToken}`,
        );
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getRoundWinnerAnnouncement(
    growingJackpotId: number,
    roundId: number,
  ): Promise<{
    displayName: string;
    proofToken: string;
    announceInChat: boolean;
  } | null> {
    const row = await this.getRoundRow(growingJackpotId, roundId);
    if (!row || row.result !== 'won') {
      return null;
    }
    const settings = parseGrowingJackpotSettings(row.settings_snapshot);
    return {
      displayName: String(row.winner_display_name),
      proofToken: String(row.proof_token),
      announceInChat: settings.announceWinnerInChat,
    };
  }

  private async getWidgetDimensions(
    accountId: number,
  ): Promise<GrowingJackpotWidgetRecord> {
    await this.ensureWidgetRow(accountId);
    const result = await this.pool().query<{
      width: number;
      height: number;
      style: unknown;
    }>(
      `
        SELECT width, height, style
        FROM growing_jackpot_widget
        WHERE account_id = $1
      `,
      [accountId],
    );
    const row = result.rows[0];
    return {
      width: Number(row?.width ?? GROWING_JACKPOT_WIDGET_DEFAULTS.width),
      height: Number(row?.height ?? GROWING_JACKPOT_WIDGET_DEFAULTS.height),
      style: parseGrowingJackpotWidgetStyle(row?.style),
    };
  }

  private async ensureWidgetRow(accountId: number): Promise<void> {
    await this.pool().query(
      `
        INSERT INTO growing_jackpot_widget (account_id)
        VALUES ($1)
        ON CONFLICT (account_id) DO NOTHING
      `,
      [accountId],
    );
  }

  async getWidget(
    accountId: number,
    userId: number,
  ): Promise<GrowingJackpotWidgetRecord> {
    await this.requireMember(accountId, userId);
    return this.getWidgetDimensions(accountId);
  }

  async patchWidget(
    accountId: number,
    userId: number,
    patch: {
      width?: number;
      height?: number;
      style?: Partial<GrowingJackpotWidgetStyle>;
    },
  ): Promise<GrowingJackpotWidgetRecord> {
    await this.requireMember(accountId, userId);
    const width =
      patch.width !== undefined
        ? Math.min(1920, Math.max(200, Math.round(patch.width)))
        : undefined;
    const height =
      patch.height !== undefined
        ? Math.min(1080, Math.max(120, Math.round(patch.height)))
        : undefined;

    if (
      width === undefined &&
      height === undefined &&
      patch.style === undefined
    ) {
      return this.getWidget(accountId, userId);
    }

    await this.ensureWidgetRow(accountId);
    const current = await this.getWidgetDimensions(accountId);
    const nextStyle = mergeGrowingJackpotWidgetStylePatch(
      current.style,
      patch.style,
    );

    const fields: string[] = ['updated_at = now()'];
    const values: unknown[] = [];
    let idx = 1;
    if (width !== undefined) {
      fields.push(`width = $${idx++}`);
      values.push(width);
    }
    if (height !== undefined) {
      fields.push(`height = $${idx++}`);
      values.push(height);
    }
    if (patch.style !== undefined) {
      fields.push(`style = $${idx++}::jsonb`);
      values.push(JSON.stringify(nextStyle));
    }
    values.push(accountId);

    await this.pool().query(
      `
        UPDATE growing_jackpot_widget
        SET ${fields.join(', ')}
        WHERE account_id = $${idx}
      `,
      values,
    );

    return this.getWidget(accountId, userId);
  }

  async getPublicWidgetByUcid(ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      throw new NotFoundException({
        status: 'not_found',
        reason: 'unknown_account',
      });
    }

    const hasAccess =
      await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return {
        status: 'unavailable' as const,
        reason: 'subscription_expired' as const,
      };
    }

    const live = await this.pool().query(
      `
        SELECT id FROM growing_jackpot
        WHERE account_id = $1 AND status = 'live'
        ORDER BY id DESC
        LIMIT 1
      `,
      [accountId],
    );
    const growingJackpotId = live.rows[0]?.id;
    const dimensions = await this.getWidgetDimensions(accountId);

    if (!growingJackpotId) {
      return { status: 'idle' as const, ...dimensions };
    }

    await this.closeDueRoundsForJackpot(Number(growingJackpotId));

    const round = await this.pool().query(
      `
        SELECT *
        FROM growing_jackpot_round
        WHERE growing_jackpot_id = $1
        ORDER BY id DESC
        LIMIT 1
      `,
      [growingJackpotId],
    );
    const row = round.rows[0];
    if (!row) {
      return {
        status: 'idle' as const,
        growingJackpotId: Number(growingJackpotId),
        ...dimensions,
      };
    }

    const mapped = this.mapRound(row);
    const settings = parseGrowingJackpotSettings(row.settings_snapshot);
    const overlaySettings = {
      winnerOverlaySeconds: settings.winnerOverlaySeconds,
      prizeDisplayCap: settings.prizeDisplayCap,
    };

    if (mapped.phase === 'accepting') {
      return {
        status: 'accepting' as const,
        round: mapped,
        joinKeyword: mapped.joinKeyword,
        settings: overlaySettings,
        ...dimensions,
      };
    }

    if (mapped.result === 'won') {
      return {
        status: 'winner' as const,
        round: mapped,
        settings: overlaySettings,
        ...dimensions,
      };
    }

    if (mapped.result === 'no_participants') {
      return {
        status: 'no_participants' as const,
        round: mapped,
        settings: overlaySettings,
        ...dimensions,
      };
    }

    return {
      status: 'idle' as const,
      growingJackpotId: Number(growingJackpotId),
      ...dimensions,
    };
  }

  matchesKeyword(message: string, keyword: string): boolean {
    return commandMatchesKeyword(message, keyword);
  }
}
