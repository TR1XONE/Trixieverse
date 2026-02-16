/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

/**
 * Verify JWT token middleware
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const payload = authService.verifyAccessToken(token);
      req.user = payload;
      req.userId = payload.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication error',
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but validates if present
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = authService.verifyAccessToken(token);
        req.user = payload;
        req.userId = payload.userId;
      } catch (error) {
        // Token is invalid but we don't fail
        console.warn('Invalid token provided:', error);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.userId || req.ip || 'anonymous';
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    const record = requests.get(key)!;

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      next();
      return;
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
      });
    }

    next();
  };
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
  });
};
