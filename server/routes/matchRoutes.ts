/**
 * Match Routes
 * API endpoints for match tracking and statistics
 */

import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import userStatsService from '../services/userStatsService';
import logger from '../utils/logger';
import db from '../database/connection';

const router = Router();

/**
 * GET /api/matches/stats
 * Get user statistics
 */
router.get('/stats', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const stats = await userStatsService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error({ message: 'Error fetching user stats', error });
    next(error);
  }
});

/**
 * GET /api/matches/history
 * Get match history for user
 */
router.get('/history', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await db.query(
      `SELECT 
         id, champion_name, role, result, kills, deaths, assists, 
         damage_dealt, gold_earned, cs, duration_seconds, match_timestamp
       FROM matches
       WHERE user_id = $1
       ORDER BY match_timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error({ message: 'Error fetching match history', error });
    next(error);
  }
});

/**
 * POST /api/matches
 * Add a new match
 * Body: { playerAccountId, championName, role, result, kills, deaths, assists, damageDelt, goldEarned, cs, durationSeconds }
 */
router.post('/', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const {
      playerAccountId,
      championName,
      role,
      result,
      kills,
      deaths,
      assists,
      damageDealt,
      goldEarned,
      cs,
      durationSeconds,
    } = req.body;

    // Validate input
    if (!playerAccountId || !championName || !role || !result) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (!['win', 'loss'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Result must be "win" or "loss"',
      });
    }

    // Add match and update stats
    const { match, stats, newAchievements } = await userStatsService.addMatchAndUpdateStats(userId, playerAccountId, {
      champion_name: championName,
      role,
      result,
      kills: kills || 0,
      deaths: deaths || 0,
      assists: assists || 0,
      damage_dealt: damageDealt || 0,
      gold_earned: goldEarned || 0,
      cs: cs || 0,
      duration_seconds: durationSeconds || 0,
      match_timestamp: new Date(),
    });

    res.json({
      success: true,
      data: {
        match,
        stats,
        newAchievements,
      },
      message: `Match recorded! ${newAchievements.length > 0 ? `${newAchievements.length} new achievement(s) unlocked!` : ''}`,
    });
  } catch (error) {
    logger.error({ message: 'Error adding match', error });
    next(error);
  }
});

/**
 * GET /api/matches/:matchId
 * Get details for a specific match
 */
router.get('/:matchId', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { matchId } = req.params;

    const result = await db.query(
      `SELECT * FROM matches WHERE id = $1 AND user_id = $2`,
      [matchId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error({ message: 'Error fetching match details', error });
    next(error);
  }
});

/**
 * GET /api/matches/champion/:championName
 * Get statistics for a specific champion
 */
router.get('/champion/:championName', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { championName } = req.params;

    const result = await db.query(
      `SELECT 
         champion_name,
         COUNT(*) as total_matches,
         COUNT(CASE WHEN result = 'win' THEN 1 END) as wins,
         ROUND(100.0 * COUNT(CASE WHEN result = 'win' THEN 1 END) / COUNT(*), 2) as win_rate,
         ROUND(AVG(kills), 2) as avg_kills,
         ROUND(AVG(deaths), 2) as avg_deaths,
         ROUND(AVG(assists), 2) as avg_assists,
         ROUND(AVG(damage_dealt), 0) as avg_damage,
         ROUND(AVG(gold_earned), 0) as avg_gold,
         ROUND(AVG(cs), 2) as avg_cs
       FROM matches
       WHERE user_id = $1 AND champion_name = $2
       GROUP BY champion_name`,
      [userId, championName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matches found for this champion',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error({ message: 'Error fetching champion statistics', error });
    next(error);
  }
});

export default router;
