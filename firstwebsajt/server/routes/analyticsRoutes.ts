/**
 * Analytics API Routes\n */

import { Router, Request, Response } from 'express';
import skillProfileService from '../services/skillProfileService';
import matchAnalysisService from '../services/matchAnalysisService';

const router = Router();

/**
 * GET /analytics/skill-profile
 * Get user skill profile
 */
router.get('/skill-profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const profile = await skillProfileService.getSkillProfile(userId, playerAccountId as string);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get skill profile' });
  }
});

/**
 * GET /analytics/trend
 * Get skill trend
 */
router.get('/trend', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const trend = await skillProfileService.calculateTrend(userId, playerAccountId as string);
    res.json({ trend });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate trend' });
  }
});

/**
 * GET /analytics/by-role
 * Get skill breakdown by role
 */
router.get('/by-role', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const data = await skillProfileService.getSkillByRole(userId, playerAccountId as string);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get role analytics' });
  }
});

/**
 * GET /analytics/by-champion
 * Get skill breakdown by champion
 */
router.get('/by-champion', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, limit = 10 } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const data = await skillProfileService.getSkillByChampion(
      userId,
      playerAccountId as string,
      parseInt(limit as string)
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get champion analytics' });
  }
});

/**
 * GET /analytics/trends
 * Get performance trends
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, days = 30 } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const trends = await skillProfileService.getPerformanceTrends(
      userId,
      playerAccountId as string,
      parseInt(days as string)
    );
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

/**
 * GET /analytics/strengths-weaknesses
 * Get strengths and weaknesses
 */
router.get('/strengths-weaknesses', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const data = await skillProfileService.getStrengthsAndWeaknesses(
      userId,
      playerAccountId as string
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

/**
 * GET /analytics/recommendations
 * Get personalized recommendations
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const recommendations = await skillProfileService.getRecommendations(
      userId,
      playerAccountId as string
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * GET /analytics/compare
 * Compare with average
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const comparison = await skillProfileService.compareWithAverage(
      userId,
      playerAccountId as string
    );
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get comparison' });
  }
});

/**
 * GET /analytics/match-history
 * Get match history
 */
router.get('/match-history', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, limit = 20 } = req.query;

    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const matches = await matchAnalysisService.getMatchHistory(
      userId,
      playerAccountId as string,
      parseInt(limit as string)
    );
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get match history' });
  }
});

export default router;
