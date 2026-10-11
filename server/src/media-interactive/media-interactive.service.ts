import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import {
  MEDIA_INTERACTIVE_DEFAULTS,
  type MediaInteractiveBackupCutover,
} from './media-interactive-defaults.js';
import {
  expandYoutubePlaylistVideoIds,
  fetchYoutubeVideoMetadata,
} from './youtube-metadata.js';
import {
  extractPlaylistId,
  extractYoutubeVideoId,
  normalizeYoutubeWatchUrl,
} from './youtube-url.js';

export type MediaInteractiveListKind = 'queue' | 'backup';
export type MediaInteractiveItemSource = 'viewer' | 'staff';
export type MediaInteractiveItemStatus =
  | 'pending'
  | 'queued'
  | 'playing'
  | 'played'
  | 'skipped'
  | 'failed'
  | 'rejected';

export type MediaInteractiveItemDto = {
  id: number;
  listKind: MediaInteractiveListKind;
  source: MediaInteractiveItemSource;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string;
  durationSeconds: number;
  requesterNick: string;
  pointsCharged: number;
  status: MediaInteractiveItemStatus;
  rejectReason: string | null;
  sortOrder: number;
  createdAt: string;
};

export type MediaInteractiveSettingsDto = {
  volume: number;
  showVideo: boolean;
  overlayWidth: number;
  overlayHeight: number;
  audioOverlayWidth: number;
  backupCutover: MediaInteractiveBackupCutover;
  maxViewerTrackDurationSeconds: number;
  kickRewardIds: string[];
  playbackPaused: boolean;
  activeSource: 'queue' | 'backup';
  playingItemId: number | null;
};

@Injectable()
export class MediaInteractiveService {
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

  private mapItem(row: Record<string, unknown>): MediaInteractiveItemDto {
    return {
      id: Number(row.id),
      listKind: row.list_kind as MediaInteractiveListKind,
      source: row.source as MediaInteractiveItemSource,
      youtubeUrl: String(row.youtube_url),
      youtubeVideoId: String(row.youtube_video_id),
      title: String(row.title),
      durationSeconds: Number(row.duration_seconds),
      requesterNick: String(row.requester_nick),
      pointsCharged: Number(row.points_charged),
      status: row.status as MediaInteractiveItemStatus,
      rejectReason: row.reject_reason ? String(row.reject_reason) : null,
      sortOrder: Number(row.sort_order),
      createdAt: new Date(row.created_at as Date).toISOString(),
    };
  }

  private async ensureSettings(accountId: number) {
    await this.pool().query(
      `
        INSERT INTO media_interactive_settings (account_id)
        VALUES ($1)
        ON CONFLICT (account_id) DO NOTHING
      `,
      [accountId],
    );
    const result = await this.pool().query(
      `SELECT * FROM media_interactive_settings WHERE account_id = $1`,
      [accountId],
    );
    return result.rows[0] as Record<string, unknown>;
  }

  private formatSettings(row: Record<string, unknown>): MediaInteractiveSettingsDto {
    const kickIds = row.kick_reward_ids;
    return {
      volume: Number(row.volume),
      showVideo: Boolean(row.show_video),
      overlayWidth: Number(row.overlay_width),
      overlayHeight: Number(row.overlay_height),
      audioOverlayWidth: Number(
        row.audio_overlay_width ?? MEDIA_INTERACTIVE_DEFAULTS.audioOverlayWidth,
      ),
      backupCutover: row.backup_cutover as MediaInteractiveBackupCutover,
      maxViewerTrackDurationSeconds: Number(
        row.max_viewer_track_duration_seconds,
      ),
      kickRewardIds: Array.isArray(kickIds)
        ? kickIds.map(String)
        : MEDIA_INTERACTIVE_DEFAULTS.kickRewardIds,
      playbackPaused: Boolean(row.playback_paused),
      activeSource: row.active_source as 'queue' | 'backup',
      playingItemId:
        row.playing_item_id === null ? null : Number(row.playing_item_id),
    };
  }

  async getSettings(
    accountId: number,
    userId: number,
  ): Promise<MediaInteractiveSettingsDto> {
    await this.requireMember(accountId, userId);
    const row = await this.ensureSettings(accountId);
    return this.formatSettings(row);
  }

  async patchSettings(
    accountId: number,
    userId: number,
    patch: Partial<{
      volume: number;
      showVideo: boolean;
      overlayWidth: number;
      overlayHeight: number;
      audioOverlayWidth: number;
      backupCutover: MediaInteractiveBackupCutover;
      maxViewerTrackDurationSeconds: number;
      kickRewardIds: string[];
    }>,
  ): Promise<MediaInteractiveSettingsDto> {
    await this.requireMember(accountId, userId);
    await this.ensureSettings(accountId);

    const fields: string[] = [];
    const values: unknown[] = [accountId];
    let idx = 2;

    if (patch.volume !== undefined) {
      fields.push(`volume = $${idx++}`);
      values.push(Math.min(100, Math.max(0, patch.volume)));
    }
    if (patch.showVideo !== undefined) {
      fields.push(`show_video = $${idx++}`);
      values.push(patch.showVideo);
    }
    if (patch.overlayWidth !== undefined) {
      fields.push(`overlay_width = $${idx++}`);
      values.push(Math.min(1920, Math.max(200, patch.overlayWidth)));
    }
    if (patch.overlayHeight !== undefined) {
      fields.push(`overlay_height = $${idx++}`);
      values.push(Math.min(1080, Math.max(120, patch.overlayHeight)));
    }
    if (patch.audioOverlayWidth !== undefined) {
      fields.push(`audio_overlay_width = $${idx++}`);
      values.push(Math.min(1920, Math.max(200, patch.audioOverlayWidth)));
    }
    if (patch.backupCutover !== undefined) {
      fields.push(`backup_cutover = $${idx++}`);
      values.push(patch.backupCutover);
    }
    if (patch.maxViewerTrackDurationSeconds !== undefined) {
      fields.push(`max_viewer_track_duration_seconds = $${idx++}`);
      values.push(Math.max(30, patch.maxViewerTrackDurationSeconds));
    }
    if (patch.kickRewardIds !== undefined) {
      fields.push(`kick_reward_ids = $${idx++}::jsonb`);
      values.push(JSON.stringify(patch.kickRewardIds.map(String)));
    }

    if (fields.length > 0) {
      fields.push('updated_at = now()');
      await this.pool().query(
        `UPDATE media_interactive_settings SET ${fields.join(', ')} WHERE account_id = $1`,
        values,
      );
    }

    const row = await this.ensureSettings(accountId);
    return this.formatSettings(row);
  }

  async listItems(
    accountId: number,
    userId: number,
    listKind: MediaInteractiveListKind,
  ): Promise<MediaInteractiveItemDto[]> {
    await this.requireMember(accountId, userId);
    const result = await this.pool().query(
      `
        SELECT * FROM media_interactive_item
        WHERE account_id = $1 AND list_kind = $2
          AND status NOT IN ('played', 'skipped', 'failed', 'rejected')
        ORDER BY sort_order ASC, id ASC
      `,
      [accountId, listKind],
    );
    return result.rows.map((row) => this.mapItem(row));
  }

  async getPlaybackState(accountId: number, userId: number) {
    await this.requireMember(accountId, userId);
    const settingsRow = await this.ensureSettings(accountId);
    const settings = this.formatSettings(settingsRow);
    let nowPlaying: MediaInteractiveItemDto | null = null;
    if (settings.playingItemId) {
      const playing = await this.pool().query(
        `SELECT * FROM media_interactive_item WHERE id = $1 AND account_id = $2`,
        [settings.playingItemId, accountId],
      );
      if (playing.rows[0]) {
        nowPlaying = this.mapItem(playing.rows[0]);
      }
    }
    return { settings, nowPlaying };
  }

  private async nextSortOrder(
    client: PoolClient,
    accountId: number,
    listKind: MediaInteractiveListKind,
  ): Promise<number> {
    const result = await client.query<{ max: number | null }>(
      `
        SELECT MAX(sort_order) AS max FROM media_interactive_item
        WHERE account_id = $1 AND list_kind = $2
      `,
      [accountId, listKind],
    );
    return (result.rows[0]?.max ?? -1) + 1;
  }

  private async insertItem(
    client: PoolClient,
    input: {
      accountId: number;
      listKind: MediaInteractiveListKind;
      source: MediaInteractiveItemSource;
      meta: { videoId: string; title: string; durationSeconds: number; watchUrl: string };
      requesterNick: string;
      pointsCharged: number;
      kickRedemptionId?: string;
      status?: MediaInteractiveItemStatus;
      rejectReason?: string;
    },
  ): Promise<MediaInteractiveItemDto> {
    const sortOrder = await this.nextSortOrder(
      client,
      input.accountId,
      input.listKind,
    );
    const result = await client.query(
      `
        INSERT INTO media_interactive_item (
          account_id, list_kind, source, youtube_url, youtube_video_id,
          title, duration_seconds, requester_nick, points_charged,
          kick_redemption_id, status, reject_reason, sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
      [
        input.accountId,
        input.listKind,
        input.source,
        input.meta.watchUrl,
        input.meta.videoId,
        input.meta.title,
        input.meta.durationSeconds,
        input.requesterNick,
        input.pointsCharged,
        input.kickRedemptionId ?? null,
        input.status ?? 'queued',
        input.rejectReason ?? null,
        sortOrder,
      ],
    );
    return this.mapItem(result.rows[0]);
  }

  async staffEnqueue(
    accountId: number,
    userId: number,
    body: { url: string; listKind: MediaInteractiveListKind },
  ): Promise<MediaInteractiveItemDto[]> {
    await this.requireMember(accountId, userId);
    const url = body.url?.trim();
    if (!url) {
      throw new BadRequestException('url is required');
    }
    const listKind = body.listKind === 'backup' ? 'backup' : 'queue';
    const memberRow = await this.pool().query<{ name: string }>(
      `
        SELECT u.name FROM account_members am
        JOIN users u ON u.id = am.user_id
        WHERE am.account_id = $1 AND am.user_id = $2 AND am.is_active = true
      `,
      [accountId, userId],
    );
    const nick = memberRow.rows[0]?.name ?? 'Stream';

    const client = await this.pool().connect();
    const created: MediaInteractiveItemDto[] = [];
    try {
      await client.query('BEGIN');
      const playlistId = extractPlaylistId(url);
      const videoIds = playlistId
        ? await expandYoutubePlaylistVideoIds(url)
        : [];
      const urls =
        videoIds.length > 0
          ? videoIds.map((id) => normalizeYoutubeWatchUrl(id))
          : [url];

      for (const singleUrl of urls) {
        const meta = await fetchYoutubeVideoMetadata(singleUrl);
        if (!meta) {
          throw new BadRequestException('Invalid YouTube URL');
        }
        created.push(
          await this.insertItem(client, {
            accountId,
            listKind,
            source: 'staff',
            meta,
            requesterNick: nick,
            pointsCharged: 0,
          }),
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await this.onQueueItemAdded(accountId);
    return created;
  }

  private async onQueueItemAdded(accountId: number): Promise<void> {
    const settingsRow = await this.ensureSettings(accountId);
    const playingId = settingsRow.playing_item_id as number | null;
    const queueNext = await this.pickNextQueueItem(accountId);
    if (!queueNext) {
      if (!playingId) {
        await this.maybeStartPlayback(accountId);
      }
      return;
    }
    if (!playingId) {
      await this.startPlayingItem(accountId, queueNext, 'queue');
      return;
    }
    const playing = await this.pool().query(
      `SELECT list_kind FROM media_interactive_item WHERE id = $1`,
      [playingId],
    );
    const listKind = playing.rows[0]?.list_kind as string | undefined;
    if (listKind === 'backup') {
      await this.startPlayingItem(accountId, queueNext, 'queue');
    }
  }

  async handleKickRedemption(payload: {
    redemptionId: string;
    rewardId: string;
    userInput: string;
    requesterNick: string;
    pointsCharged: number;
  }): Promise<{ accountId: number; item: MediaInteractiveItemDto } | null> {
    const accounts = await this.pool().query<{ account_id: number }>(
      `
        SELECT account_id FROM media_interactive_settings
        WHERE kick_reward_ids @> $1::jsonb
      `,
      [JSON.stringify([payload.rewardId])],
    );
    const accountId = accounts.rows[0]?.account_id;
    if (!accountId) {
      return null;
    }

    const settingsRow = await this.ensureSettings(accountId);
    const maxDuration = Number(settingsRow.max_viewer_track_duration_seconds);

    const existing = await this.pool().query(
      `SELECT id FROM media_interactive_item WHERE kick_redemption_id = $1`,
      [payload.redemptionId],
    );
    if (existing.rows[0]) {
      const row = await this.pool().query(
        `SELECT * FROM media_interactive_item WHERE kick_redemption_id = $1`,
        [payload.redemptionId],
      );
      return { accountId, item: this.mapItem(row.rows[0]) };
    }

    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      const meta = await fetchYoutubeVideoMetadata(payload.userInput);
      if (!meta) {
        const item = await this.insertItem(client, {
          accountId,
          listKind: 'queue',
          source: 'viewer',
          meta: {
            videoId: extractYoutubeVideoId(payload.userInput) ?? 'invalid',
            title: 'Invalid link',
            durationSeconds: 0,
            watchUrl: payload.userInput,
          },
          requesterNick: payload.requesterNick,
          pointsCharged: payload.pointsCharged,
          kickRedemptionId: payload.redemptionId,
          status: 'rejected',
          rejectReason: 'invalid_youtube_url',
        });
        await client.query('COMMIT');
        return { accountId, item };
      }

      if (
        meta.durationSeconds > 0 &&
        meta.durationSeconds > maxDuration
      ) {
        const item = await this.insertItem(client, {
          accountId,
          listKind: 'queue',
          source: 'viewer',
          meta,
          requesterNick: payload.requesterNick,
          pointsCharged: payload.pointsCharged,
          kickRedemptionId: payload.redemptionId,
          status: 'rejected',
          rejectReason: 'duration_exceeds_limit',
        });
        await client.query('COMMIT');
        return { accountId, item };
      }

      const item = await this.insertItem(client, {
        accountId,
        listKind: 'queue',
        source: 'viewer',
        meta,
        requesterNick: payload.requesterNick,
        pointsCharged: payload.pointsCharged,
        kickRedemptionId: payload.redemptionId,
        status: 'queued',
      });
      await client.query('COMMIT');
      if (item.status === 'queued') {
        await this.onQueueItemAdded(accountId);
      } else {
        await this.maybeStartPlayback(accountId);
      }
      return { accountId, item };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async reorderItems(
    accountId: number,
    userId: number,
    listKind: MediaInteractiveListKind,
    orderedIds: number[],
  ): Promise<MediaInteractiveItemDto[]> {
    await this.requireMember(accountId, userId);
    const client = await this.pool().connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(
          `
            UPDATE media_interactive_item
            SET sort_order = $1
            WHERE id = $2 AND account_id = $3 AND list_kind = $4
          `,
          [i, orderedIds[i], accountId, listKind],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return this.listItems(accountId, userId, listKind);
  }

  async removeItem(
    accountId: number,
    userId: number,
    itemId: number,
  ): Promise<void> {
    await this.requireMember(accountId, userId);
    await this.pool().query(
      `
        DELETE FROM media_interactive_item
        WHERE id = $1 AND account_id = $2 AND status != 'playing'
      `,
      [itemId, accountId],
    );
  }

  private async pickNextQueueItem(accountId: number) {
    const result = await this.pool().query(
      `
        SELECT * FROM media_interactive_item
        WHERE account_id = $1 AND list_kind = 'queue' AND status = 'queued'
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
      `,
      [accountId],
    );
    return result.rows[0] ?? null;
  }

  private async pickNextBackupItem(accountId: number) {
    const result = await this.pool().query(
      `
        SELECT * FROM media_interactive_item
        WHERE account_id = $1 AND list_kind = 'backup'
          AND status IN ('queued', 'playing')
        ORDER BY sort_order ASC, id ASC
        LIMIT 1
      `,
      [accountId],
    );
    return result.rows[0] ?? null;
  }

  async maybeStartPlayback(accountId: number): Promise<void> {
    const settingsRow = await this.ensureSettings(accountId);
    if (settingsRow.playing_item_id) {
      return;
    }

    const queueNext = await this.pickNextQueueItem(accountId);
    if (queueNext) {
      await this.startPlayingItem(accountId, queueNext, 'queue');
      return;
    }

    const backupNext = await this.pickNextBackupItem(accountId);
    if (backupNext) {
      await this.startPlayingItem(accountId, backupNext, 'backup');
    }
  }

  private async startPlayingItem(
    accountId: number,
    row: Record<string, unknown>,
    source: 'queue' | 'backup',
  ) {
    const settingsRow = await this.ensureSettings(accountId);
    const cutover = settingsRow.backup_cutover as MediaInteractiveBackupCutover;
    const currentPlayingId = settingsRow.playing_item_id as number | null;
    const activeSource = settingsRow.active_source as string;

    if (
      source === 'queue' &&
      activeSource === 'backup' &&
      currentPlayingId &&
      cutover === 'finish_current_track'
    ) {
      await this.pool().query(
        `
          UPDATE media_interactive_settings
          SET deferred_queue_item_id = $1, updated_at = now()
          WHERE account_id = $2
        `,
        [row.id, accountId],
      );
      return;
    }

    if (currentPlayingId) {
      await this.pool().query(
        `
          UPDATE media_interactive_item
          SET status = 'played'
          WHERE id = $1 AND status = 'playing'
        `,
        [currentPlayingId],
      );
    }

    await this.pool().query(
      `UPDATE media_interactive_item SET status = 'playing' WHERE id = $1`,
      [row.id],
    );
    await this.pool().query(
      `
        UPDATE media_interactive_settings
        SET playing_item_id = $1, active_source = $2, playback_paused = false,
            deferred_queue_item_id = NULL, updated_at = now()
        WHERE account_id = $3
      `,
      [row.id, source, accountId],
    );
  }

  async pause(accountId: number, userId: number, paused: boolean) {
    await this.requireMember(accountId, userId);
    await this.ensureSettings(accountId);
    await this.pool().query(
      `
        UPDATE media_interactive_settings
        SET playback_paused = $1, updated_at = now()
        WHERE account_id = $2
      `,
      [paused, accountId],
    );
  }

  async skip(accountId: number, userId: number) {
    await this.requireMember(accountId, userId);
    const settingsRow = await this.ensureSettings(accountId);
    const playingId = settingsRow.playing_item_id as number | null;
    if (!playingId) {
      return;
    }

    await this.pool().query(
      `UPDATE media_interactive_item SET status = 'skipped' WHERE id = $1`,
      [playingId],
    );
    await this.pool().query(
      `
        UPDATE media_interactive_settings
        SET playing_item_id = NULL, updated_at = now()
        WHERE account_id = $1
      `,
      [accountId],
    );
    await this.maybeStartPlayback(accountId);
  }

  async completeCurrentAndAdvance(accountId: number): Promise<void> {
    const settingsRow = await this.ensureSettings(accountId);
    const playingId = settingsRow.playing_item_id as number | null;
    if (playingId) {
      await this.pool().query(
        `UPDATE media_interactive_item SET status = 'played' WHERE id = $1`,
        [playingId],
      );
    }

    const deferredId = settingsRow.deferred_queue_item_id as number | null;
    if (deferredId) {
      const deferred = await this.pool().query(
        `SELECT * FROM media_interactive_item WHERE id = $1`,
        [deferredId],
      );
      await this.pool().query(
        `
          UPDATE media_interactive_settings
          SET playing_item_id = NULL, deferred_queue_item_id = NULL,
              updated_at = now()
          WHERE account_id = $1
        `,
        [accountId],
      );
      if (deferred.rows[0]) {
        await this.startPlayingItem(accountId, deferred.rows[0], 'queue');
        return;
      }
    }

    await this.pool().query(
      `
        UPDATE media_interactive_settings
        SET playing_item_id = NULL, updated_at = now()
        WHERE account_id = $1
      `,
      [accountId],
    );
    await this.maybeStartPlayback(accountId);
  }

  async getBurnedPoints(accountId: number, userId: number) {
    await this.requireMember(accountId, userId);
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const result = await this.pool().query(
      `
        SELECT
          COALESCE(SUM(points_charged), 0)::int AS total,
          json_agg(
            json_build_object(
              'id', id,
              'title', title,
              'requesterNick', requester_nick,
              'pointsCharged', points_charged,
              'status', status,
              'createdAt', created_at
            )
            ORDER BY created_at DESC
          ) FILTER (WHERE id IS NOT NULL) AS ledger
        FROM media_interactive_item
        WHERE account_id = $1 AND source = 'viewer'
          AND created_at >= $2
      `,
      [accountId, startOfDay.toISOString()],
    );

    const row = result.rows[0];
    return {
      burnedTotal: Number(row?.total ?? 0),
      scope: 'utc_day' as const,
      ledger: (row?.ledger as unknown[]) ?? [],
    };
  }

  async completePlaybackByUcid(ucid: string): Promise<{ ok: boolean }> {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      return { ok: false };
    }
    await this.completeCurrentAndAdvance(accountId);
    return { ok: true };
  }

  async getPublicWidgetByUcid(ucid: string) {
    const accountId = await this.database.getAccountIdByUcid(ucid);
    if (accountId === null) {
      throw new NotFoundException({ status: 'not_found' });
    }

    const hasAccess = await this.database.accountHasSubscriptionAccess(accountId);
    if (!hasAccess) {
      return { status: 'unavailable' as const, reason: 'subscription_expired' as const };
    }

    await this.maybeStartPlayback(accountId);
    const settingsRow = await this.ensureSettings(accountId);
    const settings = this.formatSettings(settingsRow);
    let nowPlaying: MediaInteractiveItemDto | null = null;
    if (settings.playingItemId) {
      const playing = await this.pool().query(
        `SELECT * FROM media_interactive_item WHERE id = $1`,
        [settings.playingItemId],
      );
      if (playing.rows[0]) {
        nowPlaying = this.mapItem(playing.rows[0]);
      }
    }

    const deferredId = settingsRow.deferred_queue_item_id as number | null;

    return {
      status: 'active' as const,
      settings: {
        volume: settings.volume,
        showVideo: settings.showVideo,
        overlayWidth: settings.overlayWidth,
        overlayHeight: settings.overlayHeight,
        audioOverlayWidth: settings.audioOverlayWidth,
        backupCutover: settings.backupCutover,
      },
      playback: {
        paused: settings.playbackPaused,
        activeSource: settings.activeSource,
        nowPlaying,
        deferredQueueItemId: deferredId,
      },
    };
  }
}
