import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import axios from 'axios';
import logger from '../utils/logger';

const router = Router();

// Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

interface BlueprintRequest {
  targetTier: string;
  role?: string;
}

interface BlueprintResponse {
  player_id: string;
  current_tier: string;
  target_tier: string;
  recommended_champions: Array<{
    champion_id: number;
    champion_name: string;
    confidence: number;
    climb_probability: number;
    win_rate: number;
  }>;
  estimated_climb_hours: number;
  climb_probability: number;
  generated_at: string;
}

/**
 * POST /api/blueprint/generate
 * Generate personalized climbing blueprint for authenticated user
 */
router.post(
  '/generate',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { targetTier, role } = req.body as BlueprintRequest;
      const userId = (req as any).userId;

      if (!targetTier) {
        return res.status(400).json({ error: 'targetTier is required' });
      }

      logger.info({
        message: 'Generating blueprint',
        userId,
        targetTier,
        role,
      });

      // Call Python ML service
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/blueprint/generate`,
        {
          player_id: userId,
          target_tier: targetTier,
          role: role || null,
        },
        {
          timeout: 30000, // 30 second timeout for ML computation
        }
      );

      if (response.data.error) {
        return res.status(400).json({ error: response.data.error });
      }

      logger.info({
        message: 'Blueprint generated successfully',
        userId,
        probability: response.data.climb_probability,
      });

      return res.json(response.data);
    } catch (error) {
      logger.error({
        message: 'Blueprint generation failed',
        error: error instanceof Error ? error.message : String(error),
        userId: (req as any).userId,
      });

      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return res
          .status(400)
          .json({ error: error.response.data?.error || 'Invalid request' });
      }

      return res.status(503).json({
        error: 'ML service temporarily unavailable',
      });
    }
  }
);

/**
 * GET /api/blueprint/:playerId
 * Fetch player's current blueprint (if cached)
 */
router.get('/:playerId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const userId = (req as any).userId;

    // Verify user can only access their own blueprint
    if (playerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch from database cache
    const response = await axios.get(
      `${ML_SERVICE_URL}/api/blueprint/${playerId}`
    );

    return res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({ error: 'Blueprint not found' });
    }

    logger.error({
      message: 'Failed to fetch blueprint',
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/blueprint/:playerId/sync
 * Sync match data and update blueprint progress
 */
router.post(
  '/:playerId/sync',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;
      const userId = (req as any).userId;

      if (playerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      logger.info({
        message: 'Syncing blueprint',
        playerId,
      });

      // Call Python service to update progress
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/blueprint/${playerId}/sync`,
        {}
      );

      logger.info({
        message: 'Blueprint synced',
        playerId,
        progress_pct: response.data.progress_pct,
      });

      return res.json({
        status: 'synced',
        progress_pct: response.data.progress_pct,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({
        message: 'Blueprint sync failed',
        error: error instanceof Error ? error.message : String(error),
      });

      return res.status(500).json({ error: 'Sync failed' });
    }
  }
);

/**
 * GET /api/blueprint/progress/:playerId
 * Get current progress against blueprint predictions
 */
router.get(
  '/progress/:playerId',
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;
      const userId = (req as any).userId;

      if (playerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Fetch progress from ML service
      const response = await axios.get(
        `${ML_SERVICE_URL}/api/blueprint/${playerId}/progress`
      );

      return res.json({
        player_id: playerId,
        current_progress: response.data.progress_pct,
        games_played: response.data.games_played,
        wins: response.data.wins,
        win_rate: response.data.win_rate,
        on_track: response.data.on_track,
        pace_vs_estimate: response.data.pace_vs_estimate,
      });
    } catch (error) {
      logger.error({
        message: 'Failed to fetch progress',
        error: error instanceof Error ? error.message : String(error),
      });

      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
