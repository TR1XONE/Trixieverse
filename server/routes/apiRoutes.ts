/**
 * Main API Routes
 * Aggregates all API endpoints
 */

import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import authRoutes from './authRoutes.js';
import accountRoutes from './accountRoutes.js';
import coachRoutes from './coachRoutes.js';
import gamificationRoutes from './gamificationRoutes.js';
import socialRoutes from './socialRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
router.use('/auth', authRoutes);

// Protected routes (auth required)
router.use('/account', authMiddleware, accountRoutes);
router.use('/coach', authMiddleware, coachRoutes);
router.use('/gamification', authMiddleware, gamificationRoutes);
router.use('/social', authMiddleware, socialRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);

export default router;
