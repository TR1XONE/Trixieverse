/**
 * TrixieVerse Server
 * The Living Coach System - Revolutionary Wild Rift Coaching Platform
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Sentry FIRST - before everything else
import { initializeSentry, sentryErrorHandler, sentryRequestHandler } from './utils/sentry';
initializeSentry();

// Import middleware
import requestLogger from './middleware/requestLogger';
import ErrorHandler from './middleware/errorHandler';
import { applySecurityMiddleware } from './middleware/security';
import { cacheMiddleware, cacheInvalidationMiddleware } from './middleware/cacheMiddleware';
import { verifyToken } from './middleware/authMiddleware';

// Import routes
import apiRoutes from './routes/apiRoutes';
import adminRoutes from './routes/adminRoutes';
import coachRoutes from './routes/coachRoutes';
import accountRoutes from './routes/accountRoutes';
import matchSyncRoutes from './routes/matchSyncRoutes';
import blueprintRoutes from './routes/blueprintRoutes';

// Import services
import logger from './utils/logger';
import { initializeDatabase } from './database/initDb';
import HealthCheck from './utils/health';

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server for WebSocket support
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ============ MIDDLEWARE ============

// Sentry request handler FIRST
app.use(sentryRequestHandler());

// Security middleware
applySecurityMiddleware(app);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Cache invalidation
app.use(cacheInvalidationMiddleware);

// ============ ROUTES ============

// Health check - basic
app.get('/api/health', async (req: Request, res: Response) => {
  const health = await HealthCheck.fullHealthCheck();
  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

// Health check - quick
app.get('/api/health/quick', async (req: Request, res: Response) => {
  const dbHealth = await HealthCheck.checkDatabase();
  const statusCode = dbHealth.status ? 200 : 503;
  res.status(statusCode).json({
    status: dbHealth.status ? 'ok' : 'down',
    responseTime: dbHealth.responseTime,
  });
});

// Main API routes
app.use('/api', apiRoutes);

// Match sync routes
app.use('/api/matches', matchSyncRoutes);

// Blueprint routes (predictive rank climbing)
app.use('/api/blueprint', blueprintRoutes);

// Legacy routes (for backward compatibility)
app.use('/api/coach', coachRoutes);
app.use('/api/account', accountRoutes);

// Admin routes (protected)
app.use('/api/admin', verifyToken, adminRoutes);

// Static files
const staticPath = path.resolve(__dirname, '..', 'dist', 'public');

app.use(express.static(staticPath));

// SPA fallback
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ============ ERROR HANDLING ============

// Sentry error handler (MUST be before other error handlers)
app.use(sentryErrorHandler());

// 404 handler
app.use(ErrorHandler.notFound);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  ErrorHandler.handle(err, req, res, next);
});

// ============ WEBSOCKET ============

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);

      // Handle different message types
      switch (message.type) {
        case 'coach_message':
          // Broadcast coach message to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: 'coach_message',
                  data: message.data,
                  timestamp: new Date().toISOString(),
                })
              );
            }
          });
          break;

        case 'match_update':
          // Broadcast match update
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: 'match_update',
                  data: message.data,
                  timestamp: new Date().toISOString(),
                })
              );
            }
          });
          break;

        case 'achievement_unlocked':
          // Broadcast achievement
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: 'achievement_unlocked',
                  data: message.data,
                  timestamp: new Date().toISOString(),
                })
              );
            }
          });
          break;
      }
    } catch (error) {
      logger.error({ message: 'WebSocket message error', error });
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    logger.error({ message: 'WebSocket error', error });
  });
});

// ============ SERVER STARTUP ============

// Initialize database first, then start server
initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`🚀 TrixieVerse Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${NODE_ENV}`);
      logger.info(`🌐 WebSocket server ready`);
      logger.info(`📚 API: http://localhost:${PORT}/api`);
      logger.info(`🔧 Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    logger.error({ message: 'Failed to initialize database', error });
    process.exit(1);
  });

// ============ GRACEFUL SHUTDOWN ============

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// ============ ERROR HANDLING ============

process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled Rejection',
    reason,
  });
});

process.on('uncaughtException', (error) => {
  logger.error({
    message: 'Uncaught Exception',
    error: error.message,
  });
  process.exit(1);
});

export default server;
export { wss };
