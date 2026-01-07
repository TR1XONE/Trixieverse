/**
 * Account Routes - Connect Wild Rift accounts via op.gg
 */

import express, { Router, Request, Response } from 'express';
import mockOpggService from '../services/mockOpggService.js';

const router = Router();

/**
 * POST /api/account/connect
 * Connect a Wild Rift account by game name and tag
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { gameName, tag } = req.body;

    if (!gameName || !tag) {
      return res.status(400).json({
        error: 'Game name and tag are required',
      });
    }

    // Search for player
    const player = await mockOpggService.searchPlayer(gameName, tag);

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
      });
    }

    // Return player data
    res.json({
      success: true,
      player,
    });
  } catch (error) {
    console.error('Error connecting account:', error);
    res.status(500).json({
      error: 'Failed to connect account',
    });
  }
});

/**
 * GET /api/account/:summonerId/stats
 * Get player stats
 */
router.get('/:summonerId/stats', async (req: Request, res: Response) => {
  try {
    const { summonerId } = req.params;

    const player = await mockOpggService.getPlayerStats(summonerId);

    if (!player) {
      return res.status(404).json({
        error: 'Player not found',
      });
    }

    res.json({
      success: true,
      player,
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      error: 'Failed to fetch player stats',
    });
  }
});

/**
 * GET /api/account/:summonerId/matches
 * Get recent matches
 */
router.get('/:summonerId/matches', async (req: Request, res: Response) => {
  try {
    const { summonerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const matches = await mockOpggService.getRecentMatches(summonerId, limit);

    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      error: 'Failed to fetch matches',
    });
  }
});

/**
 * GET /api/account/:summonerId/champions
 * Get champion statistics
 */
router.get('/:summonerId/champions', async (req: Request, res: Response) => {
  try {
    const { summonerId } = req.params;

    const champions = await mockOpggService.getChampionStats(summonerId);

    res.json({
      success: true,
      champions,
    });
  } catch (error) {
    console.error('Error fetching champion stats:', error);
    res.status(500).json({
      error: 'Failed to fetch champion stats',
    });
  }
});

/**
 * GET /api/meta/tier-list
 * Get tier list for a role
 */
router.get('/meta/tier-list', async (req: Request, res: Response) => {
  try {
    const role = req.query.role as string;

    if (!role) {
      return res.status(400).json({
        error: 'Role is required',
      });
    }

    const tierList = await mockOpggService.getTierList(role);

    res.json({
      success: true,
      tierList,
    });
  } catch (error) {
    console.error('Error fetching tier list:', error);
    res.status(500).json({
      error: 'Failed to fetch tier list',
    });
  }
});

export default router;
