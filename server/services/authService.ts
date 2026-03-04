/**
 * Authentication Service
 * Handles user registration, login, and JWT token management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import db from '../database/connection';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: Date;
}

interface AuthPayload {
  userId: string;
  email: string;
  username: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private jwtSecret: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private refreshSecret: Secret =
    process.env.REFRESH_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    'your-refresh-secret-change-in-production';
  private accessTokenExpiry: SignOptions['expiresIn'] = '15m';
  private refreshTokenExpiry: SignOptions['expiresIn'] = '7d';

  /** Map a raw DB row to a User object */
  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role ?? 'USER',
      created_at: row.created_at,
    };
  }

  /** Generate JWT access + refresh token pair */
  generateTokens(payload: AuthPayload): TokenPair {
    return {
      accessToken: jwt.sign(payload, this.jwtSecret, { expiresIn: this.accessTokenExpiry }),
      refreshToken: jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshTokenExpiry }),
    };
  }

  verifyAccessToken(token: string): AuthPayload {
    return jwt.verify(token, this.jwtSecret) as AuthPayload;
  }

  verifyRefreshToken(token: string): AuthPayload {
    return jwt.verify(token, this.refreshSecret) as AuthPayload;
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const prefix = ((base || 'discord_user')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-]/g, '')
      .slice(0, 24)) || 'discord_user';

    for (let i = 0; i < 5; i++) {
      const candidate = i === 0 ? prefix : `${prefix}_${Math.random().toString(16).slice(2, 6)}`;
      const { rows } = await db.query('SELECT id FROM users WHERE username = $1', [candidate]);
      if (rows.length === 0) return candidate;
    }
    return `${prefix}_${Date.now()}`.slice(0, 32);
  }

  async register(email: string, username: string, password: string): Promise<User> {
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) throw new Error('Email or username already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (email, username, password_hash, last_login)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, email, username, role, created_at`,
      [email, username, passwordHash]
    );
    return this.mapUser(rows[0]);
  }

  /**
   * Login / register using Discord OAuth identity.
   * Single query: looks up by discord_id OR email in one round-trip.
   */
  async loginWithDiscord(params: {
    discordId: string;
    email: string;
    username: string;
  }): Promise<{ user: User; tokens: TokenPair }> {
    const { discordId, email, username } = params;
    if (!discordId) throw new Error('Missing Discord ID');
    if (!email) throw new Error('Discord account email is required');

    // Single query — find by discord_id first, fall back to email
    const { rows } = await db.query(
      `SELECT id, email, username, role, created_at, discord_id
       FROM users
       WHERE (discord_id = $1 OR (email = $2 AND is_active = true))
       ORDER BY (discord_id = $1) DESC
       LIMIT 1`,
      [discordId, email]
    );

    let userRow = rows[0];

    if (userRow) {
      // Link discord_id if not already linked
      if (!userRow.discord_id) {
        await db.query('UPDATE users SET discord_id = $1, last_login = NOW() WHERE id = $2', [discordId, userRow.id]);
      } else {
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userRow.id]);
      }
    } else {
      // New user — create account
      const uniqueUsername = await this.generateUniqueUsername(username);
      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      const created = await db.query(
        `INSERT INTO users (email, username, password_hash, discord_id, last_login)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, email, username, role, created_at`,
        [email, uniqueUsername, passwordHash, discordId]
      );
      userRow = created.rows[0];
    }

    const tokens = this.generateTokens({
      userId: userRow.id,
      email: userRow.email,
      username: userRow.username,
    });

    return { user: this.mapUser(userRow), tokens };
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    const { rows } = await db.query(
      'SELECT id, email, username, role, password_hash, created_at FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    if (rows.length === 0) throw new Error('Invalid email or password');

    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Invalid email or password');
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const tokens = this.generateTokens({ userId: user.id, email: user.email, username: user.username });
    return { user: this.mapUser(user), tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const payload = this.verifyRefreshToken(refreshToken);
    const { rows } = await db.query(
      'SELECT id, email, username FROM users WHERE id = $1 AND is_active = true',
      [payload.userId]
    );
    if (rows.length === 0) throw new Error('User not found');
    return this.generateTokens({ userId: rows[0].id, email: rows[0].email, username: rows[0].username });
  }

  async getUserById(userId: string): Promise<User | null> {
    const { rows } = await db.query(
      'SELECT id, email, username, role, created_at FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );
    return rows[0] ? this.mapUser(rows[0]) : null;
  }

  async updateProfile(userId: string, email?: string, username?: string): Promise<User> {
    const updates: string[] = [];
    const params: any[] = [userId];
    let i = 2;
    if (email) { updates.push(`email = $${i++}`); params.push(email); }
    if (username) { updates.push(`username = $${i++}`); params.push(username); }
    if (updates.length === 0) throw new Error('No updates provided');

    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, email, username, role, created_at`,
      params
    );
    return this.mapUser(rows[0]);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const { rows } = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) throw new Error('User not found');
    if (!(await bcrypt.compare(oldPassword, rows[0].password_hash))) {
      throw new Error('Invalid password');
    }
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [await bcrypt.hash(newPassword, 10), userId]
    );
  }
}

export default new AuthService();
