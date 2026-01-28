import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { Database } from '../database/connection';
import matchProcessingService from '../services/matchProcessingService';
import logger from '../utils/logger';

const router = Router();
const db = new Database();

/**
 * POST /api/matches/sync
 * Fetch latest matches from Riot API for authenticated user
 * Body: { accountId: string, puuid: string, limit?: number }
 */
router.post('/sync', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { accountId, puuid, limit = 10 } = req.body;

    if (!accountId || !puuid) {
      return res.status(400).json({
        error: 'accountId and puuid are required',
      });
    }

    // Validate limit
    const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20);

    // Fetch and store matches
    const insertedCount = await matchProcessingService.fetchAndStoreMatches(
      db,
      userId,
      accountId,
      puuid,
      validLimit
    );

    res.json({
      success: true,
      message: `Synced ${insertedCount} new matches`,
      insertedCount,
      limit: validLimit,
    });
  } catch (error) {
    logger.error('Match sync failed', { error });
    res.status(500).json({
      error: 'Failed to sync matches',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/matches/status
 * Get sync status for user
 */
router.get(
  '/status',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;

      // Get latest match timestamp
      const result = await db.query(
        'SELECT MAX(match_timestamp) as last_sync FROM matches WHERE user_id = $1',
        [userId]
      );

      const lastSync =
        result.rows[0]?.last_sync || null;

      res.json({
        lastSync,
        hasMatches: lastSync !== null,
      });
    } catch (error) {
      logger.error('Failed to get match sync status', { error });
      res.status(500).json({
        error: 'Failed to get sync status',
      });
    }
  }
);

export default router;
