/**
 * Achievement Routes
 * API endpoints for achievement management and tracking
 */

import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import achievementTrackingService from '../services/achievementTrackingService';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/achievements
 * Get all achievements for the current user
 */
router.get('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const achievements = await achievementTrackingService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements,
      count: achievements.length,
    });
  } catch (error) {
    logger.error({ message: 'Error fetching achievements', error });
    next(error);
  }
});

/**
 * GET /api/achievements/stats
 * Get achievement statistics for the current user
 */
router.get('/stats', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const stats = await achievementTrackingService.getAchievementStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error({ message: 'Error fetching achievement stats', error });
    next(error);
  }
});

/**
 * POST /api/achievements/check
 * Check and unlock achievements based on current user data
 * Body: { totalWins, currentWinStreak, lastMatchDeaths, lastMatchKills, lastMatchDamage, winRate, totalMatches, bestChampionWinRate, bestChampionMatches }
 */
router.post('/check', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const userData = req.body;

    const newAchievements = await achievementTrackingService.checkAndUnlockAchievements(userId, userData);

    res.json({
      success: true,
      data: newAchievements,
      message: `${newAchievements.length} new achievement(s) unlocked!`,
    });
  } catch (error) {
    logger.error({ message: 'Error checking achievements', error });
    next(error);
  }
});

/**
 * GET /api/achievements/leaderboard
 * Get leaderboard of users by achievement count
 */
router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await achievementTrackingService.getAchievementLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    logger.error({ message: 'Error fetching achievement leaderboard', error });
    next(error);
  }
});

/**
 * POST /api/achievements/:achievementId/unlock
 * Manually unlock an achievement (admin/testing only)
 */
router.post('/:achievementId/unlock', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { achievementId } = req.params;

    const achievement = await achievementTrackingService.unlockAchievementManually(userId, achievementId);

    res.json({
      success: true,
      data: achievement,
      message: `Achievement "${achievement.title}" unlocked!`,
    });
  } catch (error) {
    logger.error({ message: 'Error unlocking achievement', error });
    next(error);
  }
});

export default router;
