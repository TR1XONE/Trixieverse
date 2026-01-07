/**
 * Social API Routes
 */

import { Router, Request, Response } from 'express';
import socialService from '../services/socialService.js';

const router = Router();

// ============ FRIENDS ============

/**
 * GET /social/friends
 * Get user friends list
 */
router.get('/friends', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friends = await socialService.getFriends(userId);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

/**
 * POST /social/friends/:friendId
 * Add friend
 */
router.post('/friends/:friendId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await socialService.addFriend(userId, friendId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

/**
 * DELETE /social/friends/:friendId
 * Remove friend
 */
router.delete('/friends/:friendId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await socialService.removeFriend(userId, friendId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// ============ COACHING CIRCLES ============

/**
 * GET /social/circles
 * Get user coaching circles
 */
router.get('/circles', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const circles = await socialService.getCoachingCircles(userId);
    res.json(circles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get circles' });
  }
});

/**
 * POST /social/circles
 * Create coaching circle
 */
router.post('/circles', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const circle = await socialService.createCoachingCircle(userId, {
      name,
      description: description || '',
      isPublic: isPublic || false,
    });

    res.json(circle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create circle' });
  }
});

/**
 * POST /social/circles/:circleId/join
 * Join coaching circle
 */
router.post('/circles/:circleId/join', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { circleId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await socialService.joinCoachingCircle(userId, circleId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join circle' });
  }
});

/**
 * GET /social/circles/:circleId/members
 * Get circle members
 */
router.get('/circles/:circleId/members', async (req: Request, res: Response) => {
  try {
    const { circleId } = req.params;
    const members = await socialService.getCircleMembers(circleId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get members' });
  }
});

/**
 * GET /social/circles/:circleId/feed
 * Get circle feed
 */
router.get('/circles/:circleId/feed', async (req: Request, res: Response) => {
  try {
    const { circleId } = req.params;
    const { limit = 50 } = req.query;

    const feed = await socialService.getCircleFeed(circleId, parseInt(limit as string));
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

/**
 * POST /social/circles/:circleId/post
 * Post in circle
 */
router.post('/circles/:circleId/post', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { circleId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    const post = await socialService.postInCircle(userId, circleId, content);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post' });
  }
});

// ============ TOURNAMENTS ============

/**
 * GET /social/tournaments
 * Get tournaments
 */
router.get('/tournaments', async (req: Request, res: Response) => {
  try {
    const { status = 'upcoming' } = req.query;
    const tournaments = await socialService.getTournaments(status as string);
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

/**
 * POST /social/tournaments
 * Create tournament
 */
router.post('/tournaments', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, maxPlayers, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const tournament = await socialService.createTournament(userId, {
      name,
      description: description || '',
      maxPlayers: maxPlayers || 32,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

/**
 * POST /social/tournaments/:tournamentId/join
 * Join tournament
 */
router.post('/tournaments/:tournamentId/join', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { tournamentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await socialService.joinTournament(userId, tournamentId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

// ============ SHARING ============

/**
 * POST /social/achievements/:achievementId/share
 * Share achievement
 */
router.post('/achievements/:achievementId/share', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { achievementId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const share = await socialService.shareAchievement(userId, achievementId);
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share achievement' });
  }
});

/**
 * GET /social/achievements/feed
 * Get shared achievements feed
 */
router.get('/achievements/feed', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
    const feed = await socialService.getSharedAchievementsFeed(parseInt(limit as string));
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

export default router;
