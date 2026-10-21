import type { Pool, PoolClient } from 'pg';
import {
  parseFirstReactionWidgetStyle,
  type FirstReactionWidgetStyle,
} from './first-reaction-widget-style.js';

export type FirstReactionWidgetPresetSource = 'system' | 'user';

export type FirstReactionWidgetStylePresetRow = {
  id: number;
  accountId: number | null;
  createdByUserId: number | null;
  source: FirstReactionWidgetPresetSource;
  name: string;
  styleSettings: FirstReactionWidgetStyle;
  createdAt: Date;
  updatedAt: Date;
};

function mapPresetRow(row: Record<string, unknown>): FirstReactionWidgetStylePresetRow {
  return {
    id: Number(row.id),
    accountId: row.account_id === null ? null : Number(row.account_id),
    createdByUserId:
      row.created_by_user_id === null ? null : Number(row.created_by_user_id),
    source: row.source as FirstReactionWidgetPresetSource,
    name: String(row.name),
    styleSettings: parseFirstReactionWidgetStyle(row.style_settings),
    createdAt: new Date(row.created_at as Date),
    updatedAt: new Date(row.updated_at as Date),
  };
}

export async function resolveDefaultFirstReactionSystemPresetId(
  db: Pool | PoolClient,
): Promise<number> {
  const result = await db.query(
    `
      SELECT id FROM first_reaction_widget_style_preset
      WHERE source = 'system' AND name = 'Main'
      ORDER BY id ASC
      LIMIT 1
    `,
  );
  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error('FIRST_REACTION_PRESET_NOT_SEEDED');
  }
  return Number(id);
}

export async function listFirstReactionWidgetPresets(
  db: Pool,
  accountId: number,
): Promise<FirstReactionWidgetStylePresetRow[]> {
  const result = await db.query(
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
      FROM first_reaction_widget_style_preset
      WHERE source = 'system'
         OR account_id = $1
      ORDER BY
        CASE WHEN source = 'user' THEN 0 ELSE 1 END,
        id ASC
    `,
    [accountId],
  );
  return result.rows.map((row) => mapPresetRow(row));
}

export async function getAccessibleFirstReactionWidgetPreset(
  db: Pool,
  accountId: number,
  presetId: number,
): Promise<FirstReactionWidgetStylePresetRow | null> {
  const result = await db.query(
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
      FROM first_reaction_widget_style_preset
      WHERE id = $1
        AND (source = 'system' OR account_id = $2)
    `,
    [presetId, accountId],
  );
  const row = result.rows[0];
  return row ? mapPresetRow(row) : null;
}

export async function upsertFirstReactionWidgetCustomPreset(
  db: Pool,
  accountId: number,
  createdByUserId: number,
  styleSettings: FirstReactionWidgetStyle,
): Promise<FirstReactionWidgetStylePresetRow> {
  const payload = JSON.stringify(styleSettings);

  const updated = await db.query(
    `
      UPDATE first_reaction_widget_style_preset
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
    [accountId, createdByUserId, payload],
  );

  if (updated.rows[0]) {
    return mapPresetRow(updated.rows[0]);
  }

  const inserted = await db.query(
    `
      INSERT INTO first_reaction_widget_style_preset (
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
    [accountId, createdByUserId, payload],
  );

  return mapPresetRow(inserted.rows[0]!);
}

export function formatFirstReactionWidgetPreset(
  row: FirstReactionWidgetStylePresetRow,
) {
  return {
    id: row.id,
    accountId: row.accountId,
    createdByUserId: row.createdByUserId,
    source: row.source,
    name: row.source === 'user' ? 'Custom' : row.name,
    styleSettings: row.styleSettings,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
