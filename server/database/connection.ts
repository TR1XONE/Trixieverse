/**
 * PostgreSQL Database Connection Service
 * Handles all database operations for TrixieVerse
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl?: boolean;
}

class DatabaseService {
  private pool: pkg.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'trixieverse',
      ssl: process.env.DB_SSL === 'true',
    };
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
