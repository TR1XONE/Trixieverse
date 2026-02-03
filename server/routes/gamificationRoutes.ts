/**
 * Gamification API Routes
 */

import { Router, Request, Response } from 'express';
import gamificationService from '../services/gamificationService';

const router = Router();

/**
 * GET /gamification/level
 * Get user level and XP
 */
router.get('/level', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const level = await gamificationService.getUserLevel(userId);
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get level' });
  }
});

/**
 * GET /gamification/achievements
 * Get user achievements
 */
router.get('/achievements', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const achievements = await gamificationService.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * GET /gamification/badges
 * Get user badges progress
 */
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const badges = await gamificationService.getBadgesProgress(userId);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

/**
 * GET /gamification/leaderboard
 * Get global leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = 100, timeframe = 'month' } = req.query;
    
    const leaderboard = await gamificationService.getLeaderboard(
      parseInt(limit as string),
      timeframe as 'week' | 'month' | 'all'
    );
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * GET /gamification/rank
 * Get user rank
 */
router.get('/rank', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { timeframe = 'month' } = req.query;
    const rank = await gamificationService.getUserRank(
      userId,
      timeframe as 'week' | 'month' | 'all'
    );
    
    res.json({ rank });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

export default router;
