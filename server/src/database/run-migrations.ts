import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool, PoolClient } from 'pg';

const MIGRATIONS_TABLE = 'schema_migrations';

export function resolveMigrationsDirectory(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '../../migrations');
}

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version     TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function listMigrationFiles(migrationsDir: string): Promise<string[]> {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function isMigrationApplied(
  client: PoolClient,
  version: string,
): Promise<boolean> {
  const result = await client.query<{ version: string }>(
    `SELECT version FROM ${MIGRATIONS_TABLE} WHERE version = $1`,
    [version],
  );
  return result.rowCount !== null && result.rowCount > 0;
}

/** Dev DBs created before migrations: mark initial migration applied if schema already exists. */
async function baselineLegacySchemaIfNeeded(
  client: PoolClient,
  firstMigrationVersion: string,
): Promise<void> {
  if (await isMigrationApplied(client, firstMigrationVersion)) {
    return;
  }

  const result = await client.query<{ exists: boolean }>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS exists
  `);
  if (!result.rows[0]?.exists) {
    return;
  }

  await client.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (version) VALUES ($1) ON CONFLICT DO NOTHING`,
    [firstMigrationVersion],
  );
}

async function applyMigration(
  client: PoolClient,
  version: string,
  sql: string,
): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version) VALUES ($1)`,
      [version],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function runMigrations(pool: Pool): Promise<string[]> {
  const migrationsDir = resolveMigrationsDirectory();
  const files = await listMigrationFiles(migrationsDir);
  const applied: string[] = [];

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    if (files.length > 0) {
      const firstVersion = files[0].replace(/\.sql$/i, '');
      await baselineLegacySchemaIfNeeded(client, firstVersion);
    }

    for (const file of files) {
      const version = file.replace(/\.sql$/i, '');
      if (await isMigrationApplied(client, version)) {
        continue;
      }

      const sql = await readFile(join(migrationsDir, file), 'utf8');
      await applyMigration(client, version, sql);
      applied.push(version);
    }
  } finally {
    client.release();
  }

  return applied;
}
