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

  private async generateUniqueUsername(base: string): Promise<string> {
    const normalized = (base || 'discord_user')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\-]/g, '')
      .slice(0, 24);

    const prefix = normalized.length > 0 ? normalized : 'discord_user';

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate =
        attempt === 0 ? prefix : `${prefix}_${Math.random().toString(16).slice(2, 6)}`;

      const existing = await db.query('SELECT id FROM users WHERE username = $1', [candidate]);
      if (existing.rows.length === 0) return candidate;
    }

    return `${prefix}_${Date.now()}`.slice(0, 32);
  }

  /**
   * Register a new user
   */
  async register(email: string, username: string, password: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email or username already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, username, password_hash, last_login)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id, email, username, created_at`,
        [email, username, passwordHash]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login / register using Discord OAuth identity.
   * Links by discord_id first, then falls back to matching existing user by email.
   */
  async loginWithDiscord(params: {
    discordId: string;
    email: string;
    username: string;
  }): Promise<{ user: User; tokens: TokenPair }> {
    const { discordId, email, username } = params;
    if (!discordId) throw new Error('Missing Discord ID');
    if (!email) throw new Error('Discord account email is required');

    // 1) Try find by discord_id
    const byDiscord = await db.query(
      'SELECT id, email, username, created_at FROM users WHERE discord_id = $1 AND is_active = true',
      [discordId]
    );

    let userRow = byDiscord.rows[0];

    // 2) Else, try link by email
    if (!userRow) {
      const byEmail = await db.query(
        'SELECT id, email, username, created_at FROM users WHERE email = $1 AND is_active = true',
        [email]
      );
      userRow = byEmail.rows[0];

      if (userRow) {
        await db.query('UPDATE users SET discord_id = $1 WHERE id = $2', [discordId, userRow.id]);
      }
    }

    // 3) Else, create a new user with a random password
    if (!userRow) {
      const uniqueUsername = await this.generateUniqueUsername(username);
      const passwordHash = await bcrypt.hash(randomUUID(), 10);

      const created = await db.query(
        `INSERT INTO users (email, username, password_hash, discord_id, last_login)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING id, email, username, created_at`,
        [email, uniqueUsername, passwordHash, discordId]
      );
      userRow = created.rows[0];
    } else {
      await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userRow.id]);
    }

    const tokens = this.generateTokens({
      userId: userRow.id,
      email: userRow.email,
      username: userRow.username,
    });

    return {
      user: {
        id: userRow.id,
        email: userRow.email,
        username: userRow.username,
        created_at: userRow.created_at,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: TokenPair }> {
    try {
      // Find user
      const result = await db.query(
        'SELECT id, email, username, password_hash FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await db.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
        },
        tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(payload: AuthPayload): TokenPair {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as AuthPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      // Get fresh user data
      const result = await db.query(
        'SELECT id, email, username FROM users WHERE id = $1 AND is_active = true',
        [payload.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT id, email, username, created_at FROM users WHERE id = $1 AND is_active = true',
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, email?: string, username?: string): Promise<User> {
    try {
      const updates: string[] = [];
      const params: any[] = [userId];
      let paramIndex = 2;

      if (email) {
        updates.push(`email = $${paramIndex}`);
        params.push(email);
        paramIndex++;
      }

      if (username) {
        updates.push(`username = $${paramIndex}`);
        params.push(username);
        paramIndex++;
      }

      if (updates.length === 0) {
        throw new Error('No updates provided');
      }

      const result = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $1
         RETURNING id, email, username, created_at`,
        params
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const result = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Verify old password
      const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new AuthService();
