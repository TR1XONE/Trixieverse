/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

import express, { Router, Request, Response } from 'express';
import authService from '../services/authService.js';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware.js';

const router = Router();

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
