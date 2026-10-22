import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { initialSessionStatusOnCreate } from '../session-lifecycle/initial-session-status-on-create.js';
import {
  FIRST_REACTION_WIDGET_DEFAULTS,
  FIRST_REACTION_WIDGET_INSERT_SQL,
  firstReactionWidgetInsertParams,
} from './first-reaction-widget-defaults.js';
import {
  formatFirstReactionWidgetPreset,
  getAccessibleFirstReactionWidgetPreset,
  listFirstReactionWidgetPresets,
  resolveDefaultFirstReactionSystemPresetId,
  upsertFirstReactionWidgetCustomPreset,
} from './first-reaction-widget-presets.js';
import {
  parseFirstReactionWidgetStyle,
  type FirstReactionWidgetStyle,
} from './first-reaction-widget-style.js';
import {
  mergeFirstReactionSettingsPatch,
  parseFirstReactionSettings,
  type FirstReactionSettings,
} from './first-reaction-settings.js';
import {
  buildFirstReactionDrawOrderBy,
  type FirstReactionDrawSortField,
  type FirstReactionDrawSortOrder,
} from './first-reaction-draw-list.js';
import {
  pickGeneratedKeyword,
  resolveManualKeyword,
} from './first-reaction-word-picker.js';

export type FirstReactionStatus = 'live' | 'off_air' | 'archived';

export type FirstReactionRecord = {
  id: number;
  accountId: number;
  title: string;
  status: FirstReactionStatus;
  settings: FirstReactionSettings;
  nextStartAllowedAt: string | null;
  createdAt: string;
  createdByUserId: number;
  createdByName: string;
};

export type FirstReactionDrawRecord = {
  id: number;
  firstReactionId: number;
  drawIndex: number;
  keyword: string;
  keywordSource: 'manual' | 'generated';
  phase: 'preview' | 'accepting' | 'closed';
  result: string | null;
  previewStartedAt: string;
  acceptingStartedAt: string | null;
  acceptDeadlineAt: string | null;
  closedAt: string | null;
  winnerProvider: string | null;
  winnerProviderUserId: string | null;
  winnerDisplayName: string | null;
  winningMessageId: string | null;
  wonAt: string | null;
  proofToken: string | null;
  fulfillmentStatus: string;
  startedByUserId: number;
  createdAt: string;
};

@Injectable()
export class FirstReactionService {
  constructor(private readonly database: DatabaseService) {}

  private pool() {
    return this.database.getPool();
  }

  async requireMember(accountId: number, userId: number): Promise<void> {
    const ok = await this.database.hasActiveMembership(accountId, userId);
    if (!ok) {
      throw new ForbiddenException('Not a member of this account');
    }
  }

  private mapSession(row: Record<string, unknown>): FirstReactionRecord {
    return {
      id: Number(row.id),
      accountId: Number(row.account_id),
      title: String(row.title),
      status: row.status as FirstReactionStatus,
      settings: parseFirstReactionSettings(row.settings),
      nextStartAllowedAt: row.next_start_allowed_at
        ? new Date(row.next_start_allowed_at as Date).toISOString()
        : null,
      createdAt: new Date(row.created_at as Date).toISOString(),
      createdByUserId: Number(row.created_by_user_id),
      createdByName: String(row.created_by_name ?? ''),
    };
  }

  private mapDraw(row: Record<string, unknown>): FirstReactionDrawRecord {
    return {
      id: Number(row.id),
      firstReactionId: Number(row.first_reaction_id),
      drawIndex: Number(row.draw_index),
      keyword: String(row.keyword),
      keywordSource: row.keyword_source as 'manual' | 'generated',
      phase: row.phase as FirstReactionDrawRecord['phase'],
      result: row.result ? String(row.result) : null,
      previewStartedAt: new Date(row.preview_started_at as Date).toISOString(),
      acceptingStartedAt: row.accepting_started_at
        ? new Date(row.accepting_started_at as Date).toISOString()
        : null,
      acceptDeadlineAt: row.accept_deadline_at
        ? new Date(row.accept_deadline_at as Date).toISOString()
        : null,
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
      winningMessageId: row.winning_message_id
        ? String(row.winning_message_id)
        : null,
      wonAt: row.won_at ? new Date(row.won_at as Date).toISOString() : null,
      proofToken: row.proof_token ? String(row.proof_token) : null,
      fulfillmentStatus: String(row.fulfillment_status),
      startedByUserId: Number(row.started_by_user_id),
      createdAt: new Date(row.created_at as Date).toISOString(),
    };
  }

  private async getSessionRow(
    accountId: number,
    firstReactionId: number,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.pool().query(
      `
        SELECT
          fr.*,
          u.name AS created_by_name
        FROM first_reaction fr
        JOIN users u ON u.id = fr.created_by_user_id
        WHERE fr.account_id = $1
          AND fr.id = $2
      `,
      [accountId, firstReactionId],
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
        ? `AND status = 'archived'`
        : archived === 'all'
          ? ''
          : `AND status != 'archived'`;

    const countResult = await this.pool().query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM first_reaction
        WHERE account_id = $1
        ${whereArchived}
      `,
      [accountId],
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);
    const offset = (page - 1) * limit;

    const list = await this.pool().query(
      `
        SELECT
          fr.*,
          u.name AS created_by_name
        FROM first_reaction fr
        JOIN users u ON u.id = fr.created_by_user_id
        WHERE fr.account_id = $1
        ${whereArchived}
        ORDER BY fr.created_at DESC
        LIMIT $2 OFFSET $3
      `,
      [accountId, limit, offset],
    );

    return {
      records: list.rows.map((row) => this.mapSession(row)),
      total,
      page,
      limit,
    };
  }

  async getSession(accountId: number, userId: number, firstReactionId: number) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
    await this.expireStaleAcceptingDraws(firstReactionId);
    const activeDraw = await this.getActiveDrawRow(firstReactionId);
    return {
      record: this.mapSession(row),
      activeDraw: activeDraw ? this.mapDraw(activeDraw) : null,
    };
  }

  async createSession(accountId: number, userId: number, title: string) {
    await this.requireMember(accountId, userId);
    const trimmed = title.trim();
    if (trimmed.length === 0 || trimmed.length > 200) {
      throw new BadRequestException('Invalid title');
    }

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      const liveCheck = await client.query<{ has_live: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1 FROM first_reaction
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
          INSERT INTO first_reaction (
            account_id, created_by_user_id, title, status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `,
        [accountId, userId, trimmed, initialStatus],
      );

      const defaultPresetId = await resolveDefaultFirstReactionSystemPresetId(
        client,
      );
      await client.query(
        FIRST_REACTION_WIDGET_INSERT_SQL,
        firstReactionWidgetInsertParams(
          accountId,
          FIRST_REACTION_WIDGET_DEFAULTS.width,
          FIRST_REACTION_WIDGET_DEFAULTS.height,
          defaultPresetId,
        ),
      );

      await client.query('COMMIT');
      const row = inserted.rows[0]!;
      const withName = await this.getSessionRow(accountId, Number(row.id));
      return { record: this.mapSession(withName!) };
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
    firstReactionId: number,
    patch: { title?: string; settings?: Record<string, unknown> },
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (patch.title !== undefined) {
      const trimmed = patch.title.trim();
      if (trimmed.length === 0 || trimmed.length > 200) {
        throw new BadRequestException('Invalid title');
      }
      fields.push(`title = $${idx++}`);
      values.push(trimmed);
    }

    if (patch.settings !== undefined) {
      const current = parseFirstReactionSettings(row.settings);
      const merged = mergeFirstReactionSettingsPatch(current, patch.settings);
      fields.push(`settings = $${idx++}::jsonb`);
      values.push(JSON.stringify(merged));
    }

    if (fields.length === 0) {
      return this.getSession(accountId, userId, firstReactionId);
    }

    fields.push(`updated_at = now()`);
    values.push(accountId, firstReactionId);

    await this.pool().query(
      `
        UPDATE first_reaction
        SET ${fields.join(', ')}
        WHERE account_id = $${idx++}
          AND id = $${idx}
          AND status != 'archived'
      `,
      values,
    );

    return this.getSession(accountId, userId, firstReactionId);
  }

  async archiveSession(
    accountId: number,
    userId: number,
    firstReactionId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    const result = await this.pool().query(
      `
        UPDATE first_reaction
        SET status = 'archived', updated_at = now()
        WHERE account_id = $1 AND id = $2 AND status != 'archived'
      `,
      [accountId, firstReactionId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }

  async goLive(accountId: number, userId: number, firstReactionId: number) {
    await this.requireMember(accountId, userId);
    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      const target = await client.query<{ status: string }>(
        `
          SELECT status FROM first_reaction
          WHERE account_id = $1 AND id = $2
        `,
        [accountId, firstReactionId],
      );
      const status = target.rows[0]?.status;
      if (!status || status === 'archived') {
        throw new NotFoundException();
      }
      if (status === 'live') {
        await client.query('COMMIT');
        return this.getSession(accountId, userId, firstReactionId);
      }

      await client.query(
        `
          UPDATE first_reaction
          SET status = 'off_air', updated_at = now()
          WHERE account_id = $1 AND status = 'live'
        `,
        [accountId],
      );

      await client.query(
        `
          UPDATE first_reaction
          SET status = 'live', updated_at = now()
          WHERE account_id = $1 AND id = $2 AND status = 'off_air'
        `,
        [accountId, firstReactionId],
      );

      await client.query('COMMIT');
      return this.getSession(accountId, userId, firstReactionId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deactivate(accountId: number, userId: number, firstReactionId: number) {
    await this.requireMember(accountId, userId);
    const result = await this.pool().query(
      `
        UPDATE first_reaction
        SET status = 'off_air', updated_at = now()
        WHERE account_id = $1 AND id = $2 AND status = 'live'
      `,
      [accountId, firstReactionId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
    return this.getSession(accountId, userId, firstReactionId);
  }

  async listDraws(
    accountId: number,
    userId: number,
    firstReactionId: number,
    page: number,
    limit: number,
    sortBy: FirstReactionDrawSortField,
    sortOrder: FirstReactionDrawSortOrder,
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row) {
      throw new NotFoundException();
    }

    const countResult = await this.pool().query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND is_archived = false
      `,
      [firstReactionId],
    );
    const total = Number.parseInt(countResult.rows[0]?.count ?? '0', 10);
    const maxPage = Math.max(1, Math.ceil(total / limit) || 1);
    const resolvedPage = Math.min(Math.max(1, page), maxPage);
    const offset = (resolvedPage - 1) * limit;
    const orderBy = buildFirstReactionDrawOrderBy(sortBy, sortOrder);

    const draws = await this.pool().query(
      `
        SELECT *
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND is_archived = false
        ORDER BY ${orderBy}
        LIMIT $2 OFFSET $3
      `,
      [firstReactionId, limit, offset],
    );
    return {
      draws: draws.rows.map((r) => this.mapDraw(r)),
      total,
      page: resolvedPage,
      limit,
      sortBy,
      sortOrder,
    };
  }

  private async assertCanStartDraw(
    client: PoolClient,
    session: FirstReactionRecord,
  ): Promise<void> {
    if (session.status !== 'live') {
      throw new BadRequestException('Session is not live');
    }
    if (session.nextStartAllowedAt) {
      const allowed = new Date(session.nextStartAllowedAt).getTime();
      if (Date.now() < allowed) {
        throw new BadRequestException('Start cooldown active');
      }
    }
    await client.query(
      `
        UPDATE first_reaction_draw
        SET
          phase = 'closed',
          result = 'cancelled',
          closed_at = now(),
          fulfillment_status = 'not_applicable',
          stopped_by_user_id = NULL
        WHERE first_reaction_id = $1
          AND phase = 'preview'
      `,
      [session.id],
    );

    const active = await client.query(
      `
        SELECT id FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND phase = 'accepting'
        LIMIT 1
      `,
      [session.id],
    );
    if (active.rows.length > 0) {
      throw new BadRequestException('Draw already in progress');
    }
  }

  private async resolveKeywordForNewDraw(
    client: PoolClient,
    session: FirstReactionRecord,
    manualKeyword?: string,
  ): Promise<{
    keyword: string;
    keywordSource: 'manual' | 'generated';
    generationMeta: Record<string, unknown> | null;
  }> {
    if (session.settings.wordSource === 'generated') {
      const picked = await pickGeneratedKeyword(
        client,
        session.id,
        session.settings,
      );
      return {
        keyword: picked.keyword,
        keywordSource: 'generated',
        generationMeta: picked.generationMeta,
      };
    }
    const keyword = resolveManualKeyword(session.settings, manualKeyword);
    if (keyword.length < 2 || keyword.length > 20) {
      throw new BadRequestException('Invalid keyword');
    }
    return {
      keyword,
      keywordSource: 'manual',
      generationMeta: null,
    };
  }

  async startDraw(
    accountId: number,
    userId: number,
    firstReactionId: number,
    body: { keyword?: string },
  ) {
    await this.requireMember(accountId, userId);
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
    const session = this.mapSession(row);
    const settings = session.settings;

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      await this.assertCanStartDraw(client, session);

      const resolved = await this.resolveKeywordForNewDraw(
        client,
        session,
        body.keyword,
      );

      const countResult = await client.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM first_reaction_draw
          WHERE first_reaction_id = $1
        `,
        [firstReactionId],
      );
      const drawIndex =
        Number.parseInt(countResult.rows[0]?.count ?? '0', 10) + 1;

      const acceptDeadlineSql = settings.acceptTimeoutEnabled
        ? `now() + ($8::int * interval '1 second')`
        : 'NULL';

      const inserted = await client.query(
        `
          INSERT INTO first_reaction_draw (
            first_reaction_id,
            draw_index,
            keyword,
            keyword_source,
            generation_meta,
            settings_snapshot,
            phase,
            accepting_started_at,
            accept_deadline_at,
            started_by_user_id
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            'accepting',
            now(),
            ${acceptDeadlineSql},
            $7
          )
          RETURNING *
        `,
        settings.acceptTimeoutEnabled
          ? [
              firstReactionId,
              drawIndex,
              resolved.keyword,
              resolved.keywordSource,
              resolved.generationMeta
                ? JSON.stringify(resolved.generationMeta)
                : null,
              JSON.stringify(session.settings),
              userId,
              settings.acceptTimeoutSeconds,
            ]
          : [
              firstReactionId,
              drawIndex,
              resolved.keyword,
              resolved.keywordSource,
              resolved.generationMeta
                ? JSON.stringify(resolved.generationMeta)
                : null,
              JSON.stringify(session.settings),
              userId,
            ],
      );

      await client.query('COMMIT');
      return { draw: this.mapDraw(inserted.rows[0]!) };
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        if (error.message === 'KEYWORD_REQUIRED') {
          throw new BadRequestException('Keyword is required');
        }
        if (error.message === 'EMPTY_WORD_POOL') {
          throw new BadRequestException('Word pool is empty');
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async stopDraw(
    accountId: number,
    userId: number,
    firstReactionId: number,
    drawId: number,
  ) {
    await this.requireMember(accountId, userId);
    return this.closeDraw(
      accountId,
      firstReactionId,
      drawId,
      'stopped',
      userId,
      'not_applicable',
    );
  }

  private async closeDraw(
    accountId: number,
    firstReactionId: number,
    drawId: number,
    result: string,
    userId: number,
    fulfillment: string,
  ) {
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row) {
      throw new NotFoundException();
    }
    const settings = parseFirstReactionSettings(row.settings);

    const updated = await this.pool().query(
      `
        UPDATE first_reaction_draw
        SET
          phase = 'closed',
          result = $1,
          closed_at = now(),
          stopped_by_user_id = $2,
          fulfillment_status = $3
        WHERE id = $4
          AND first_reaction_id = $5
          AND phase = 'accepting'
        RETURNING *
      `,
      [result, userId, fulfillment, drawId, firstReactionId],
    );
    if (updated.rows.length === 0) {
      throw new NotFoundException();
    }

    if (settings.startCooldownEnabled && settings.startCooldownSeconds > 0) {
      await this.pool().query(
        `
          UPDATE first_reaction
          SET next_start_allowed_at = now() + ($1::int * interval '1 second')
          WHERE id = $2
        `,
        [settings.startCooldownSeconds, firstReactionId],
      );
    } else {
      await this.pool().query(
        `UPDATE first_reaction SET next_start_allowed_at = NULL WHERE id = $1`,
        [firstReactionId],
      );
    }

    return { draw: this.mapDraw(updated.rows[0]!) };
  }

  async patchDrawFulfillment(
    accountId: number,
    userId: number,
    firstReactionId: number,
    drawId: number,
    status: 'pending' | 'fulfilled',
  ) {
    await this.requireMember(accountId, userId);
    const updated = await this.pool().query(
      `
        UPDATE first_reaction_draw
        SET
          fulfillment_status = $1,
          fulfilled_at = CASE WHEN $1 = 'fulfilled' THEN now() ELSE NULL END,
          fulfilled_by_user_id = CASE WHEN $1 = 'fulfilled' THEN $2 ELSE NULL END
        WHERE id = $3
          AND first_reaction_id = $4
          AND result = 'won'
        RETURNING *
      `,
      [status, userId, drawId, firstReactionId],
    );
    if (updated.rows.length === 0) {
      throw new NotFoundException();
    }
    return { draw: this.mapDraw(updated.rows[0]!) };
  }

  private async assertMutableSession(
    accountId: number,
    firstReactionId: number,
  ): Promise<void> {
    const row = await this.getSessionRow(accountId, firstReactionId);
    if (!row || row.status === 'archived') {
      throw new NotFoundException();
    }
  }

  async archiveDraw(
    accountId: number,
    userId: number,
    firstReactionId: number,
    drawId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    await this.assertMutableSession(accountId, firstReactionId);

    const result = await this.pool().query(
      `
        UPDATE first_reaction_draw d
        SET is_archived = true
        FROM first_reaction fr
        WHERE d.first_reaction_id = fr.id
          AND fr.account_id = $1
          AND d.first_reaction_id = $2
          AND d.id = $3
          AND d.is_archived = false
          AND d.phase = 'closed'
      `,
      [accountId, firstReactionId, drawId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }
  }

  async archiveAllDraws(
    accountId: number,
    userId: number,
    firstReactionId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    await this.assertMutableSession(accountId, firstReactionId);

    await this.pool().query(
      `
        UPDATE first_reaction_draw d
        SET is_archived = true
        FROM first_reaction fr
        WHERE d.first_reaction_id = fr.id
          AND fr.account_id = $1
          AND d.first_reaction_id = $2
          AND d.is_archived = false
          AND d.phase = 'closed'
      `,
      [accountId, firstReactionId],
    );
  }

  private async ensureFirstReactionWidgetRow(accountId: number): Promise<void> {
    const presetId = await resolveDefaultFirstReactionSystemPresetId(
      this.pool(),
    );
    await this.pool().query(
      FIRST_REACTION_WIDGET_INSERT_SQL,
      firstReactionWidgetInsertParams(
        accountId,
        FIRST_REACTION_WIDGET_DEFAULTS.width,
        FIRST_REACTION_WIDGET_DEFAULTS.height,
        presetId,
      ),
    );
  }

  private mapWidgetRow(row: Record<string, unknown>) {
    return {
      id: Number(row.id),
      accountId: Number(row.account_id),
      width: Number(row.width),
      height: Number(row.height),
      presetId: Number(row.preset_id),
      style: parseFirstReactionWidgetStyle(row.preset_style_settings),
      createdAt: new Date(row.created_at as Date).toISOString(),
      updatedAt: new Date(row.updated_at as Date).toISOString(),
    };
  }

  private async fetchWidgetRow(
    accountId: number,
  ): Promise<Record<string, unknown>> {
    const result = await this.pool().query(
      `
        SELECT
          w.id,
          w.account_id,
          w.width,
          w.height,
          w.preset_id,
          w.created_at,
          w.updated_at,
          p.style_settings AS preset_style_settings
        FROM first_reaction_widget w
        JOIN first_reaction_widget_style_preset p ON p.id = w.preset_id
        WHERE w.account_id = $1
      `,
      [accountId],
    );
    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException();
    }
    return row;
  }

  async getWidget(accountId: number, userId: number) {
    await this.requireMember(accountId, userId);
    await this.ensureFirstReactionWidgetRow(accountId);
    return this.mapWidgetRow(await this.fetchWidgetRow(accountId));
  }

  async listWidgetPresets(accountId: number, userId: number) {
    await this.requireMember(accountId, userId);
    const rows = await listFirstReactionWidgetPresets(this.pool(), accountId);
    return rows.map((row) => formatFirstReactionWidgetPreset(row));
  }

  async upsertWidgetCustomPreset(
    accountId: number,
    userId: number,
    styleSettings: FirstReactionWidgetStyle,
  ) {
    await this.requireMember(accountId, userId);
    const row = await upsertFirstReactionWidgetCustomPreset(
      this.pool(),
      accountId,
      userId,
      styleSettings,
    );
    return formatFirstReactionWidgetPreset(row);
  }

  async patchWidget(
    accountId: number,
    userId: number,
    patch: {
      width?: number;
      height?: number;
      presetId?: number;
      style?: Partial<FirstReactionWidgetStyle>;
    },
  ) {
    await this.requireMember(accountId, userId);

    if (patch.style !== undefined) {
      throw new BadRequestException(
        'Widget style fields must be saved via presets',
      );
    }

    const width = patch.width !== undefined
      ? Math.min(1920, Math.max(200, Math.round(patch.width)))
      : undefined;
    const height = patch.height !== undefined
      ? Math.min(1080, Math.max(120, Math.round(patch.height)))
      : undefined;

    if (
      width === undefined &&
      height === undefined &&
      patch.presetId === undefined
    ) {
      return this.getWidget(accountId, userId);
    }

    await this.ensureFirstReactionWidgetRow(accountId);

    if (patch.presetId !== undefined) {
      const preset = await getAccessibleFirstReactionWidgetPreset(
        this.pool(),
        accountId,
        patch.presetId,
      );
      if (!preset) {
        throw new BadRequestException('Widget preset not found');
      }
    }

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
    if (patch.presetId !== undefined) {
      fields.push(`preset_id = $${idx++}`);
      values.push(patch.presetId);
    }
    values.push(accountId);

    await this.pool().query(
      `
        UPDATE first_reaction_widget
        SET ${fields.join(', ')}
        WHERE account_id = $${idx}
      `,
      values,
    );

    return this.getWidget(accountId, userId);
  }

  private async getActiveDrawRow(
    firstReactionId: number,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.pool().query(
      `
        SELECT *
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND phase = 'accepting'
        ORDER BY id DESC
        LIMIT 1
      `,
      [firstReactionId],
    );
    return result.rows[0] ?? null;
  }

  async expireStaleAcceptingDraws(firstReactionId: number): Promise<void> {
    const sessionRow = await this.pool().query(
      `SELECT settings FROM first_reaction WHERE id = $1`,
      [firstReactionId],
    );
    const settings = parseFirstReactionSettings(sessionRow.rows[0]?.settings);
    if (!settings.acceptTimeoutEnabled) {
      return;
    }

    const expired = await this.pool().query(
      `
        UPDATE first_reaction_draw
        SET
          phase = 'closed',
          result = 'expired',
          closed_at = now(),
          fulfillment_status = 'not_applicable'
        WHERE first_reaction_id = $1
          AND phase = 'accepting'
          AND accept_deadline_at IS NOT NULL
          AND accept_deadline_at <= now()
        RETURNING id
      `,
      [firstReactionId],
    );

    if (expired.rows.length > 0 && settings.startCooldownEnabled) {
      await this.pool().query(
        `
          UPDATE first_reaction
          SET next_start_allowed_at = now() + ($1::int * interval '1 second')
          WHERE id = $2
        `,
        [settings.startCooldownSeconds, firstReactionId],
      );
    }
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
        SELECT id FROM first_reaction
        WHERE account_id = $1 AND status = 'live'
        ORDER BY id DESC
        LIMIT 1
      `,
      [accountId],
    );
    const liveId = live.rows[0]?.id;
    if (!liveId) {
      const anySession = await this.pool().query(
        `
          SELECT 1 FROM first_reaction
          WHERE account_id = $1 AND status != 'archived'
          LIMIT 1
        `,
        [accountId],
      );
      return {
        status: 'unavailable' as const,
        reason: anySession.rows.length > 0 ? 'no_live_session' : 'no_sessions',
      };
    }

    await this.expireStaleAcceptingDraws(Number(liveId));

    const widget = await this.pool().query(
      `
        SELECT
          w.width,
          w.height,
          p.style_settings AS preset_style_settings
        FROM first_reaction_widget w
        JOIN first_reaction_widget_style_preset p ON p.id = w.preset_id
        WHERE w.account_id = $1
      `,
      [accountId],
    );
    const width = Number(widget.rows[0]?.width ?? 500);
    const height = Number(widget.rows[0]?.height ?? 500);
    const style = parseFirstReactionWidgetStyle(
      widget.rows[0]?.preset_style_settings,
    );

    const drawRow = await this.getActiveDrawRow(Number(liveId));
    const recentWinner = await this.pool().query(
      `
        SELECT *
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND phase = 'closed'
          AND result = 'won'
          AND is_archived = false
        ORDER BY closed_at DESC NULLS LAST
        LIMIT 1
      `,
      [liveId],
    );

    const settings = parseFirstReactionSettings(
      (
        await this.pool().query(`SELECT settings FROM first_reaction WHERE id = $1`, [
          liveId,
        ])
      ).rows[0]?.settings,
    );

    let winnerOverlay: FirstReactionDrawRecord | null = null;
    const winnerRow = recentWinner.rows[0];
    if (winnerRow && winnerRow.closed_at) {
      const closedAt = new Date(winnerRow.closed_at as Date).getTime();
      const showUntil =
        closedAt + settings.winnerOverlaySeconds * 1000;
      if (Date.now() < showUntil && !drawRow) {
        winnerOverlay = this.mapDraw(winnerRow);
      }
    }

    if (drawRow) {
      const draw = this.mapDraw(drawRow);
      return {
        status: 'active' as const,
        width,
        height,
        style,
        phase: draw.phase,
        keyword: draw.keyword,
        acceptingStartedAt: draw.acceptingStartedAt,
        acceptDeadlineAt: draw.acceptDeadlineAt,
        winner: draw.phase === 'closed' ? draw : null,
      };
    }

    if (winnerOverlay) {
      return {
        status: 'active' as const,
        width,
        height,
        style,
        phase: 'closed' as const,
        keyword: winnerOverlay.keyword,
        acceptingStartedAt: null,
        acceptDeadlineAt: null,
        winner: winnerOverlay,
      };
    }

    return {
      status: 'active' as const,
      width,
      height,
      style,
      phase: 'idle' as const,
      keyword: null,
      acceptingStartedAt: null,
      acceptDeadlineAt: null,
      winner: null,
    };
  }

  static createProofToken(): string {
    return `WIN-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async tryClaimWinner(input: {
    accountId: number;
    firstReactionId: number;
    drawId: number;
    provider: 'kick';
    providerUserId: string;
    displayName: string;
    messageId: string;
    settings: FirstReactionSettings;
  }): Promise<{ claimed: boolean; draw?: FirstReactionDrawRecord }> {
    await this.expireStaleAcceptingDraws(input.firstReactionId);

    const proofToken = FirstReactionService.createProofToken();
    const updated = await this.pool().query(
      `
        UPDATE first_reaction_draw
        SET
          phase = 'closed',
          result = 'won',
          closed_at = now(),
          winner_provider = $1,
          winner_provider_user_id = $2,
          winner_display_name = $3,
          winning_message_id = $4,
          won_at = now(),
          proof_token = $5,
          fulfillment_status = 'pending'
        WHERE id = $6
          AND first_reaction_id = $7
          AND phase = 'accepting'
          AND winner_provider_user_id IS NULL
        RETURNING *
      `,
      [
        input.provider,
        input.providerUserId,
        input.displayName,
        input.messageId,
        proofToken,
        input.drawId,
        input.firstReactionId,
      ],
    );

    if (updated.rows.length === 0) {
      return { claimed: false };
    }

    if (
      input.settings.startCooldownEnabled &&
      input.settings.startCooldownSeconds > 0
    ) {
      await this.pool().query(
        `
          UPDATE first_reaction
          SET next_start_allowed_at = now() + ($1::int * interval '1 second')
          WHERE id = $2
        `,
        [input.settings.startCooldownSeconds, input.firstReactionId],
      );
    }

    return { claimed: true, draw: this.mapDraw(updated.rows[0]!) };
  }

  async getIntakeContext(accountId: number): Promise<{
    firstReactionId: number;
    drawId: number;
    keyword: string;
    settings: FirstReactionSettings;
    preAcceptOpensAt: number | null;
  } | null> {
    const live = await this.pool().query(
      `
        SELECT id, settings
        FROM first_reaction
        WHERE account_id = $1 AND status = 'live'
        ORDER BY id DESC
        LIMIT 1
      `,
      [accountId],
    );
    const session = live.rows[0];
    if (!session) {
      return null;
    }

    const firstReactionId = Number(session.id);
    await this.expireStaleAcceptingDraws(firstReactionId);

    const draw = await this.pool().query(
      `
        SELECT id, keyword, accepting_started_at, settings_snapshot
        FROM first_reaction_draw
        WHERE first_reaction_id = $1
          AND phase = 'accepting'
        ORDER BY id DESC
        LIMIT 1
      `,
      [firstReactionId],
    );
    const row = draw.rows[0];
    if (!row) {
      return null;
    }

    const settings = parseFirstReactionSettings(row.settings_snapshot);
    let preAcceptOpensAt: number | null = null;
    if (settings.preAcceptDelayMs > 0 && row.accepting_started_at) {
      preAcceptOpensAt =
        new Date(row.accepting_started_at as Date).getTime() +
        settings.preAcceptDelayMs;
    }

    return {
      firstReactionId,
      drawId: Number(row.id),
      keyword: String(row.keyword),
      settings,
      preAcceptOpensAt,
    };
  }
}
