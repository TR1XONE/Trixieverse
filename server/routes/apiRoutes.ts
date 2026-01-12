/**
 * Main API Routes
 * Aggregates all API endpoints
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
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
router.use('/account', verifyToken, accountRoutes);
router.use('/coach', verifyToken, coachRoutes);
router.use('/gamification', verifyToken, gamificationRoutes);
router.use('/social', verifyToken, socialRoutes);
router.use('/analytics', verifyToken, analyticsRoutes);

export default router;
