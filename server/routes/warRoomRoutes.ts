import { Router, Request, Response, NextFunction } from 'express';
import { getGeminiClient, getGeminiModel } from '../wildriftCoach/services/geminiClient.js';
import logger from '../utils/logger.js';

const router = Router();

interface WarRoomAdviceRequest {
    champion: string;
    role: string;
    enemies?: string[];
    userProfile?: { rank?: string; playstyle?: string };
}

async function callGeminiWithRetry(prompt: string, maxRetries = 3): Promise<string> {
    const ai = getGeminiClient();
    const model = getGeminiModel();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return response.text ?? '';
        } catch (err: any) {
            const isRateLimit =
                err?.message?.includes('RESOURCE_EXHAUSTED') ||
                err?.message?.includes('retry') ||
                err?.status === 429;

            if (isRateLimit && attempt < maxRetries - 1) {
                const match = err?.message?.match(/retry in ([\d.]+)s/i);
                const delayMs = match ? parseFloat(match[1]) * 1000 : (attempt + 1) * 4000;
                logger.warn(`Gemini rate limit, retrying in ${delayMs}ms (attempt ${attempt + 1})`);
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }
            throw err;
        }
    }
    throw new Error('Max retries exceeded');
}

// POST /api/warroom/advice  – real Gemini-powered pre-match coaching
router.post('/advice', async (req: Request, res: Response, next: NextFunction) => {
    const { champion, role, enemies = [], userProfile } = req.body as WarRoomAdviceRequest;

    if (!champion || !role) {
        return res.status(400).json({ error: 'champion and role are required' });
    }

    const prompt = `You are an expert Wild Rift (mobile) coach giving pre-match advice. Wild Rift is the MOBILE version of League of Legends — different items, different mechanics, no Rift Herald, shorter game times (~20 min), different item shop. Return ONLY valid JSON, no markdown, no code fences.

Player info:
- Champion: ${champion}
- Role: ${role === 'solo' ? 'Baron lane (top)' : role === 'duo' ? 'Dragon lane ADC' : role}
- Enemy team: ${enemies.length > 0 ? enemies.join(', ') : 'unknown'}
${userProfile?.rank ? `- Rank: ${userProfile.rank}` : ''}
${userProfile?.playstyle ? `- Playstyle: ${userProfile.playstyle}` : ''}

Use WILD RIFT specific items and terminology (e.g. Trinity Force, Infinity Edge, Luden's Tempest, Rabadon's Deathcap, Glorious Enchant, Stasis Enchant, Teleport Enchant — NOT Mythic items or Summoner's Rift-only items). Output schema exactly:
{"strategy":"2-3 sentence strategic overview for Wild Rift","items":["WR item tip 1","WR item tip 2","WR item tip 3"],"macroGoal":"1 sentence Wild Rift macro objective","encouragement":"1 short motivational sentence","threats":["threat1","threat2"],"winCondition":"main win condition for Wild Rift"}`;

    try {
        const content = await callGeminiWithRetry(prompt);
        const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const advice = JSON.parse(cleaned);
        return res.json({ success: true, data: advice });
    } catch (error: any) {
        const isRateLimit =
            error?.message?.includes('RESOURCE_EXHAUSTED') ||
            error?.message?.includes('retry') ||
            error?.status === 429;

        if (isRateLimit) {
            logger.warn(`Gemini rate limit hit after retries: ${error?.message}`);
            return res.status(429).json({
                success: false,
                rateLimited: true,
                message: 'Gemini API rate limit reached. Please wait a few seconds and try again.',
            });
        }

        logger.error(`War Room advice failed: ${error?.message}`);
        // Graceful fallback
        res.json({
            success: true,
            data: {
                strategy: `Focus on your strengths with ${champion} in ${role}. Play safely early and look for opportunities to impact the game.`,
                items: ['Prioritize core items first', 'Adapt to enemy team composition', 'Consider defensive items if behind'],
                macroGoal: "Secure objectives and play around your team's win conditions.",
                encouragement: "Stay calm, trust the process, and you've got this! 💪",
                threats: enemies.slice(0, 2),
                winCondition: "Win your lane, then rotate to help your team.",
            },
        });
    }
});

export default router;
