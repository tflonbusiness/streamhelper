import '../load-env.js';
import { Pool } from 'pg';
import { runMigrations } from './run-migrations.js';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5433/caz_agent';

const pool = new Pool({ connectionString });

try {
  const applied = await runMigrations(pool);
  if (applied.length === 0) {
    console.log('No pending migrations.');
  } else {
    console.log(`Applied migrations: ${applied.join(', ')}`);
  }
} finally {
  await pool.end();
}
