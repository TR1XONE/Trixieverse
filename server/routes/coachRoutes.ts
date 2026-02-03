/**
 * Coach API Routes
 * Handles all coach-related endpoints
 */

import { Router, Request, Response } from 'express';
import CoachAgent from '../agents/coachAgent';

const router = Router();

// Store coach agents per user (in production, use database)
const coachAgents = new Map<string, CoachAgent>();

/**
 * Initialize or get coach for a user
 */
function getOrCreateCoach(userId: string, personality: any, memory: any): CoachAgent {
  if (!coachAgents.has(userId)) {
    coachAgents.set(userId, new CoachAgent(personality, memory));
  }
  return coachAgents.get(userId)!;
}

/**
 * POST /api/coach/response
 * Generate a personalized coach response
 */
router.post('/response', async (req: Request, res: Response) => {
  try {
    const { userId, personality, memory, context } = req.body;

    if (!userId || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse(context);

    // Update memory
    if (memory) {
      coach.updateMemory(memory);
    }

    res.json({
      success: true,
      response,
      memory: coach.getMemory(),
    });
  } catch (error) {
    console.error('Error generating coach response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

/**
 * GET /api/coach/memory/:userId
 * Get coach memory for a user
 */
router.get('/memory/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const coach = coachAgents.get(userId);

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json({
      success: true,
      memory: coach.getMemory(),
    });
  } catch (error) {
    console.error('Error getting coach memory:', error);
    res.status(500).json({ error: 'Failed to get memory' });
  }
});

/**
 * PUT /api/coach/memory/:userId
 * Update coach memory
 */
router.put('/memory/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { memory } = req.body;

    if (!memory) {
      return res.status(400).json({ error: 'Missing memory data' });
    }

    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    coach.updateMemory(memory);

    res.json({
      success: true,
      memory: coach.getMemory(),
    });
  } catch (error) {
    console.error('Error updating coach memory:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

/**
 * PUT /api/coach/personality/:userId
 * Update coach personality
 */
router.put('/personality/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { personality } = req.body;

    if (!personality) {
      return res.status(400).json({ error: 'Missing personality data' });
    }

    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    coach.setPersonality(personality);

    res.json({
      success: true,
      personality: coach.getPersonality(),
    });
  } catch (error) {
    console.error('Error updating coach personality:', error);
    res.status(500).json({ error: 'Failed to update personality' });
  }
});

/**
 * GET /api/coach/personality/:userId
 * Get coach personality
 */
router.get('/personality/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const coach = coachAgents.get(userId);

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.json({
      success: true,
      personality: coach.getPersonality(),
    });
  } catch (error) {
    console.error('Error getting coach personality:', error);
    res.status(500).json({ error: 'Failed to get personality' });
  }
});

/**
 * POST /api/coach/greeting
 * Get a personalized greeting
 */
router.post('/greeting', async (req: Request, res: Response) => {
  try {
    const { userId, personality, memory } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({ type: 'greeting' });

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error generating greeting:', error);
    res.status(500).json({ error: 'Failed to generate greeting' });
  }
});

/**
 * POST /api/coach/analyze-match
 * Analyze a match
 */
router.post('/analyze-match', async (req: Request, res: Response) => {
  try {
    const { userId, personality, memory, matchData } = req.body;

    if (!userId || !matchData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({
      type: 'match_analysis',
      data: matchData,
    });

    res.json({
      success: true,
      response,
      analysis: {
        result: matchData.result,
        kda: matchData.kda,
        cs: matchData.cs,
      },
    });
  } catch (error) {
    console.error('Error analyzing match:', error);
    res.status(500).json({ error: 'Failed to analyze match' });
  }
});

/**
 * POST /api/coach/celebrate-achievement
 * Celebrate an achievement
 */
router.post('/celebrate-achievement', async (req: Request, res: Response) => {
  try {
    const { userId, personality, memory, achievement } = req.body;

    if (!userId || !achievement) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({
      type: 'achievement',
      data: achievement,
    });

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error celebrating achievement:', error);
    res.status(500).json({ error: 'Failed to celebrate achievement' });
  }
});

export default router;
