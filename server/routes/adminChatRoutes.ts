import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';
import { getGeminiClient, getGeminiModel } from '../wildriftCoach/services/geminiClient';
import db from '../database/connection';

const router = Router();

const ADMIN_SYSTEM_PROMPT = `You are an intelligent AI assistant embedded in the Trixieverse admin panel.
Trixieverse is a Wild Rift coaching and counterpick platform.

You help the admin with:
- Managing champion data, builds, runes, and matchups in the database
- Understanding the codebase and architecture
- Drafting content, patch notes, or community messages
- Debugging issues and analyzing logs
- Planning new features and improvements
- Answering any general questions

Be concise, direct, and technical when appropriate. You have full context of the system.`;

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

/**
 * POST /api/admin/chat
 * Admin-only Gemini chat endpoint
 */
router.post('/chat', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify ADMIN role from DB
        const userRes = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]);
        if (!userRes.rows.length || userRes.rows[0].role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        const { messages } = req.body as { messages?: ChatMessage[] };
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const ai = getGeminiClient();
        const model = getGeminiModel();

        // Build contents for Gemini (multi-turn)
        const contents = messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));

        const result = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: ADMIN_SYSTEM_PROMPT,
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        res.json({ reply: text });
    } catch (error) {
        console.error('[AdminChat] Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

export default router;
