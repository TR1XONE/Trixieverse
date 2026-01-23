/**
 * PostgreSQL Database Connection Service
 * Handles all database operations for TrixieVerse
 */

import * as pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

class DatabaseService {
  private pool: any = null;
  private config: DatabaseConfig;

  constructor() {
    // Support both custom DB variables and Railway's standard variables
    const user = process.env.DB_USER || process.env.PGUSER || 'postgres';
    const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'password';
    const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432');
    const database = process.env.DB_NAME || process.env.PGDATABASE || 'trixieverse';
    
    // Railway uses DATABASE_URL, parse it if available
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        this.config = {
          user: url.username || user,
          password: url.password || password,
          host: url.hostname || host,
          port: parseInt(url.port || String(port)),
          database: url.pathname.slice(1) || database,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      } catch (error) {
        console.warn('Failed to parse DATABASE_URL, using individual variables');
        this.config = {
          user,
          password,
          host,
          port,
          database,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      }
    } else {
      this.config = {
        user,
        password,
        host,
        port,
        database,
        ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }
  }

  /**
   * Initialize database connection pool
   */
  async connect(): Promise<void> {
    try {
      this.pool = new Pool(this.config);

      // Test connection
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Execute a query
   */
  async query<T = any>(text: string, params?: any[]): Promise<pkg.QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    try {
      return await this.pool.query<T>(text, params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (client: pkg.PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database disconnected');
    }
  }

  /**
   * Get pool for advanced operations
   */
  getPool(): pkg.Pool | null {
    return this.pool;
  }
}

export default new DatabaseService();
