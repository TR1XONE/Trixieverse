/**
 * Database Initialization
 * Automatically creates tables and schema on startup
 */

import db from './connection';
import * as fs from 'fs';
import * as path from 'path';

// Admin emails that get auto-promoted to ADMIN role on every startup
const ADMIN_EMAILS = [
  'trx@live.se',
  'rasmuslundstroem@gmail.com',
];

/**
 * Initialize database with schema on startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Starting database initialization...');

    // Connect to database
    await db.connect();
    console.log('✅ Connected to database');

    // Check if users table exists
    const result = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );

    const tablesExist = result.rows[0].exists;

    if (!tablesExist) {
      console.log('📊 Tables not found, creating schema...');

      const schemaPath = path.join(process.cwd(), 'server', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let executedCount = 0;
      for (const statement of statements) {
        try {
          await db.query(statement);
          executedCount++;
        } catch (error: any) {
          if (!error.message?.includes('already exists') && !error.message?.includes('does not exist')) {
            console.error('Schema creation error:', error.message);
          }
        }
      }

      console.log(`✅ Database schema created! (${executedCount} statements executed)`);
    } else {
      console.log('✅ Database tables already exist');
    }

    // ── Migrations (always run, idempotent) ──────────────────────────────

    const checkCol = async (table: string, col: string) => {
      const r = await db.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.columns
         WHERE table_schema='public' AND table_name=$1 AND column_name=$2) AS exists`,
        [table, col]
      );
      return Boolean(r.rows?.[0]?.exists);
    };

    // discord_id
    if (!(await checkCol('users', 'discord_id'))) {
      await db.query("ALTER TABLE users ADD COLUMN discord_id VARCHAR(64) UNIQUE");
      console.log('✅ Migrated users.discord_id');
    }

    // role
    if (!(await checkCol('users', 'role'))) {
      await db.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER'");
      console.log('✅ Migrated users.role');
    }

    // ── Auto-promote admin accounts ───────────────────────────────────────
    if (ADMIN_EMAILS.length > 0) {
      try {
        const placeholders = ADMIN_EMAILS.map((_, i) => `$${i + 1}`).join(', ');
        const promoted = await db.query(
          `UPDATE users SET role = 'ADMIN'
           WHERE email IN (${placeholders}) AND (role IS NULL OR role != 'ADMIN')
           RETURNING email`,
          ADMIN_EMAILS
        );
        if (promoted.rows.length > 0) {
          console.log(`✅ Promoted to ADMIN: ${promoted.rows.map((r: any) => r.email).join(', ')}`);
        }
      } catch (e: any) {
        console.warn('⚠️ Admin promotion failed:', e?.message);
      }
    }

    // ── Auto-seed champions if table is empty ─────────────────────────────
    try {
      const tableExists = await db.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables
         WHERE table_schema='public' AND table_name='champions') AS exists`
      );
      if (tableExists.rows[0]?.exists) {
        const count = await db.query('SELECT COUNT(*) FROM champions');
        if (parseInt(count.rows[0].count) === 0) {
          console.log('🌱 Champions table empty — auto-seeding...');
          const { seedCounterData } = await import('../scripts/seedCounterData.ts');
          await seedCounterData(true); // skipConnect=true, already connected
          console.log('✅ Champion data seeded automatically');
        } else {
          console.log(`✅ ${count.rows[0].count} champions in database`);
        }
      }
    } catch (e: any) {
      console.warn('⚠️ Auto-seed failed:', e?.message);
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
