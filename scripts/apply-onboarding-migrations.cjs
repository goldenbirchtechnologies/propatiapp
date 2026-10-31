/* eslint-disable no-console */
/**
 * Applies the two onboarding migrations that were never recorded in
 * _prisma_migrations, over the pooled (pgbouncer) connection.
 *
 * `prisma migrate deploy` routes through DIRECT_URL (db.<ref>.supabase.co:5432),
 * which is unreachable from this network, and `db push` hangs introspecting the
 * 69-table schema over the pool. Both migration files are written with
 * `IF NOT EXISTS` guards throughout, so applying them statement-by-statement is
 * safe and idempotent.
 *
 * Run: node --env-file=.env scripts/apply-onboarding-migrations.cjs
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const MIGRATIONS = [
  '20261027150000_add_user_onboarding_and_jurisdiction',
  '20261101090000_add_role_onboarding_profiles',
];

/**
 * Splits a migration file into single statements, respecting `$$` dollar-quoted
 * blocks, quoted strings/identifiers, and comments. Naive splitting on `;`
 * would cut a DO $$ ... $$ block in half.
 */
function splitSQL(sql) {
  const out = [];
  let cur = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inDollar = false;
  let dollarTag = '';
  let inLineComment = false;
  let inBlockComment = false;

  while (i < sql.length) {
    const c = sql[i];
    const n = sql[i + 1];

    if (inLineComment) {
      cur += c;
      if (c === '\n') inLineComment = false;
      i += 1;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && n === '/') {
        cur += c + n;
        i += 2;
        inBlockComment = false;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }
    if (inSingle) {
      cur += c;
      if (c === "'") {
        if (n === "'") {
          cur += n;
          i += 2;
          continue;
        }
        inSingle = false;
      }
      i += 1;
      continue;
    }
    if (inDouble) {
      cur += c;
      if (c === '"') {
        if (n === '"') {
          cur += n;
          i += 2;
          continue;
        }
        inDouble = false;
      }
      i += 1;
      continue;
    }
    if (inDollar) {
      if (sql.startsWith(dollarTag, i)) {
        cur += dollarTag;
        i += dollarTag.length;
        inDollar = false;
        continue;
      }
      cur += c;
      i += 1;
      continue;
    }

    if (c === '-' && n === '-') {
      cur += c + n;
      i += 2;
      inLineComment = true;
      continue;
    }
    if (c === '/' && n === '*') {
      cur += c + n;
      i += 2;
      inBlockComment = true;
      continue;
    }
    if (c === "'") {
      cur += c;
      inSingle = true;
      i += 1;
      continue;
    }
    if (c === '"') {
      cur += c;
      inDouble = true;
      i += 1;
      continue;
    }
    if (c === '$') {
      const match = sql.slice(i).match(/^\$[A-Za-z_]*\$/);
      if (match) {
        dollarTag = match[0];
        cur += dollarTag;
        i += dollarTag.length;
        inDollar = true;
        continue;
      }
    }
    if (c === ';') {
      out.push(cur);
      cur = '';
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }

  if (cur.trim()) out.push(cur);

  return out
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^(--[^\n]*\s*)+$/.test(s));
}

async function main() {
  const prisma = new PrismaClient();
  let failures = 0;

  try {
    for (const name of MIGRATIONS) {
      const file = path.join(__dirname, '..', 'prisma', 'migrations', name, 'migration.sql');
      const sql = fs.readFileSync(file, 'utf8');
      const statements = splitSQL(sql);
      console.log(`\n=== ${name} (${statements.length} statements) ===`);

      for (let idx = 0; idx < statements.length; idx += 1) {
        const statement = statements[idx];
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (error) {
          const message = error.message || '';
          // The guarded DO blocks catch `duplicate_object`, but an existing
          // index raises `duplicate_table`, so a re-run reports an object that
          // is already in the desired state as a failure. Treat it as done.
          if (/already exists/i.test(message)) {
            console.log(`  ok [${idx}] already exists`);
            continue;
          }
          failures += 1;
          const head = statement.replace(/\s+/g, ' ').slice(0, 120);
          console.error(`  FAIL [${idx}] ${head}`);
          console.error(`       ${message.split('\n').filter(Boolean)[0]}`);
        }
      }
      if (failures === 0) console.log('  all statements applied');
    }

    if (failures > 0) {
      console.error(`\n${failures} statement(s) failed — not recording migrations.`);
      process.exitCode = 1;
      return;
    }

    // Keep _prisma_migrations truthful so a later `migrate deploy` does not
    // try to re-add columns that now exist.
    for (const name of MIGRATIONS) {
      const file = path.join(__dirname, '..', 'prisma', 'migrations', name, 'migration.sql');
      const checksum = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      const existing = await prisma.$queryRawUnsafe(
        'select id from _prisma_migrations where migration_name = $1',
        name
      );
      if (existing.length > 0) {
        console.log(`  recorded already: ${name}`);
        continue;
      }
      await prisma.$executeRawUnsafe(
        `insert into _prisma_migrations
           (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         values ($1, $2, now(), $3, null, null, now(), 1)`,
        crypto.randomUUID(),
        checksum,
        name
      );
      console.log(`  recorded: ${name}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('ERR', error.message);
  process.exitCode = 1;
});
