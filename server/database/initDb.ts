/**
 * Database Initialization
 * Automatically creates tables and schema on startup
 */

import db from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      
      // Read schema.sql
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      // Split by semicolon and filter empty statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      // Execute each statement
      let executedCount = 0;
      for (const statement of statements) {
        try {
          await db.query(statement);
          executedCount++;
        } catch (error: any) {
          // Ignore already exists errors
          if (error.message && (error.message.includes('already exists') || error.message.includes('does not exist'))) {
            // Skip
          } else {
            console.error('Schema creation error:', error.message);
          }
        }
      }

      console.log(`✅ Database schema created! (${executedCount} statements executed)`);
    } else {
      console.log('✅ Database tables already exist');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
