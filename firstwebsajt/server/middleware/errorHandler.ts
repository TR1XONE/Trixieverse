/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

class ErrorHandler {
  /**
   * Handle errors
   */
  static handle(err: AppError, req: Request, res: Response, next: NextFunction) {
    err.statusCode = err.statusCode || 500;

    // Log error
    logger.error({
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      stack: err.stack,
    });

    // Send error response
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  /**
   * Async error wrapper
   */
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * 404 handler
   */
  static notFound(req: Request, res: Response, next: NextFunction) {
    const error: AppError = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  }

  /**
   * Validation error handler
   */
  static validationError(errors: any[]) {
    const message = errors.map((e) => e.msg).join(', ');
    const error: AppError = new Error(message);
    error.statusCode = 400;
    return error;
  }

  /**
   * Authentication error
   */
  static authError(message: string = 'Unauthorized') {
    const error: AppError = new Error(message);
    error.statusCode = 401;
    return error;
  }

  /**
   * Authorization error
   */
  static forbiddenError(message: string = 'Forbidden') {
    const error: AppError = new Error(message);
    error.statusCode = 403;
    return error;
  }

  /**
   * Conflict error
   */
  static conflictError(message: string = 'Conflict') {
    const error: AppError = new Error(message);
    error.statusCode = 409;
    return error;
  }

  /**
   * Rate limit error
   */
  static rateLimitError() {
    const error: AppError = new Error('Too many requests, please try again later');
    error.statusCode = 429;
    return error;
  }
}

export default ErrorHandler;
