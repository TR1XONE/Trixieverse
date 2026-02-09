/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

import express, { Router, Request, Response } from 'express';
import { createHmac, randomUUID } from 'crypto';
import authService from '../services/authService';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function signDiscordState(payloadB64: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return createHmac('sha256', secret).update(payloadB64).digest('hex');
}

function buildDiscordState(redirectUri: string): string {
  const payload = base64UrlEncode(
    JSON.stringify({
      nonce: randomUUID(),
      redirectUri,
      ts: Date.now(),
    })
  );
  const sig = signDiscordState(payload);
  return `${payload}.${sig}`;
}

function verifyDiscordState(state: string): { redirectUri: string } {
  const [payload, sig] = state.split('.');
  if (!payload || !sig) {
    throw new Error('Invalid state');
  }
  const expected = signDiscordState(payload);
  if (expected !== sig) {
    throw new Error('Invalid state');
  }
  const decoded = JSON.parse(base64UrlDecode(payload));
  if (!decoded?.redirectUri || typeof decoded.redirectUri !== 'string') {
    throw new Error('Invalid state payload');
  }
  return { redirectUri: decoded.redirectUri };
}

/**
 * GET /api/auth/discord/start
 * Redirects to Discord OAuth authorization endpoint
 */
router.get('/discord/start', (req: Request, res: Response) => {
  try {
    const clientId = getRequiredEnv('DISCORD_CLIENT_ID');
    const redirectUri =
      (typeof req.query.redirectUri === 'string' && req.query.redirectUri) ||
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/discord/callback`;

    const state = buildDiscordState(redirectUri);

    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify email');
    url.searchParams.set('state', state);

    res.redirect(302, url.toString());
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to start Discord auth',
    });
  }
});

/**
 * POST /api/auth/discord/exchange
 * Exchanges a Discord OAuth code for tokens, fetches user info, and mints app JWT tokens.
 */
router.post('/discord/exchange', async (req: Request, res: Response) => {
  try {
    const clientId = getRequiredEnv('DISCORD_CLIENT_ID');
    const clientSecret = getRequiredEnv('DISCORD_CLIENT_SECRET');

    const { code, state } = req.body as { code?: string; state?: string };
    if (!code || !state) {
      return res.status(400).json({ error: 'code and state are required' });
    }

    const { redirectUri } = verifyDiscordState(state);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenPayload: any = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok) {
      return res.status(401).json({
        error: tokenPayload?.error_description || tokenPayload?.error || 'Discord token exchange failed',
      });
    }

    const discordAccessToken = tokenPayload?.access_token as string | undefined;
    if (!discordAccessToken) {
      return res.status(401).json({ error: 'Discord token response missing access_token' });
    }

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `Bearer ${discordAccessToken}`,
        accept: 'application/json',
      },
    });

    const discordUser: any = await userRes.json().catch(() => ({}));
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Failed to fetch Discord user' });
    }

    const discordId = discordUser?.id as string | undefined;
    const email = discordUser?.email as string | undefined;
    const username =
      (discordUser?.global_name as string | undefined) ||
      (discordUser?.username as string | undefined) ||
      'discord_user';

    if (!discordId) {
      return res.status(400).json({ error: 'Discord user missing id' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Discord user missing email (did you request the email scope?)' });
    }

    const { user, tokens } = await authService.loginWithDiscord({
      discordId,
      email,
      username,
    });

    res.json({
      success: true,
      user: { ...user, discordId },
      tokens,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Discord login failed',
    });
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Register user
    const user = await authService.register(email, username, password);

    // Generate tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    res.status(201).json({
      success: true,
      user,
      tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Login
    const { user, tokens } = await authService.login(email, password);

    res.json({
      success: true,
      user,
      tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
      });
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const user = await authService.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { email, username } = req.body;

    const user = await authService.updateProfile(req.userId, email, username);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'New passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      });
    }

    await authService.changePassword(req.userId, oldPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to change password',
    });
  }
});

export default router;
