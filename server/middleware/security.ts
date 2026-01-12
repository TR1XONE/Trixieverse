/**
 * Security Middleware
 * Rate limiting, CSRF protection, and security headers
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'mongo-sanitize';
import ErrorHandler from './errorHandler.js';

/**
 * Rate limiters
 */

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many API requests, please try again later',
});

/**
 * Security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Use helmet for security headers
  helmet()(req, res, next);
}

/**
 * CSRF Protection
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check CSRF token
  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || token !== sessionToken) {
    return next(ErrorHandler.forbiddenError('Invalid CSRF token'));
  }

  next();
}

/**
 * Input sanitization
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body) {
    req.body = mongoSanitize()(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = mongoSanitize()(req.query);
  }

  next();
}

/**
 * SQL Injection prevention
 */
export function preventSQLInjection(req: Request, res: Response, next: NextFunction) {
  const sqlKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', 'UNION', 'EXEC', 'SCRIPT'];
  const checkString = (str: string) => {
    return sqlKeywords.some((keyword) => str.toUpperCase().includes(keyword));
  };

  // Check body
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && checkString(value)) {
        return next(ErrorHandler.forbiddenError('Invalid input detected'));
      }
    }
  }

  // Check query
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string' && checkString(value)) {
        return next(ErrorHandler.forbiddenError('Invalid input detected'));
      }
    }
  }

  next();
}

/**
 * XSS Prevention
 */
export function preventXSS(req: Request, res: Response, next: NextFunction) {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  const checkString = (str: string) => {
    return xssPatterns.some((pattern) => pattern.test(str));
  };

  // Check body
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && checkString(value)) {
        return next(ErrorHandler.forbiddenError('Invalid input detected'));
      }
    }
  }

  next();
}

/**
 * CORS Configuration
 */
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

/**
 * Security middleware chain
 */
export function applySecurityMiddleware(app: any) {
  // Security headers
  app.use(helmet());

  // CORS
  app.use(require('cors')(corsOptions));

  // Rate limiting
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Input sanitization
  app.use(sanitizeInput);

  // XSS prevention
  app.use(preventXSS);

  // SQL injection prevention
  app.use(preventSQLInjection);
}
