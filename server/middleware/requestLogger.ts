/**
 * Request Logger Middleware\n * Logs all incoming requests and responses
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export default function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Log request
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Capture response
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log performance
    logger.performance(`${req.method} ${req.path}`, duration, statusCode);

    // Log errors
    if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} - ${statusCode}`, {
        userId: req.user?.id,
        ip: req.ip,
        duration,
      });
    }

    return originalSend.call(this, data);
  };

  next();
}
