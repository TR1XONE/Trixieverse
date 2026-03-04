import type { MatchStats } from '../models/MatchStats';
import { z } from 'zod';
import logger from '../../utils/logger';
import { getGeminiClient, getGeminiModel } from './geminiClient';

export interface SingleMatchAnalysis {
  matchId: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  score: number;
}

const singleMatchAnalysisSchema = z.object({
  matchId: z.string().min(1),
  summary: z.string().min(1),
  strengths: z.array(z.string()).max(10),
  improvements: z.array(z.string()).max(10),
  score: z.number().min(0).max(100),
});

export class SingleMatchAnalysisService {
  async analyze(match: MatchStats): Promise<SingleMatchAnalysis> {
    const fallback = this.buildFallback(match);

    try {
      const ai = getGeminiClient();
      const modelName = getGeminiModel();

      const prompt = `You are a Wild Rift coach. Return ONLY valid JSON, no markdown, no extra keys.
Analyze this single match and produce: a short summary, strengths, improvements, and a 0-100 score.
Output schema: { "matchId": string, "summary": string, "strengths": string[], "improvements": string[], "score": number }
Match data: ${JSON.stringify(match)}`;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      const content = result.text ?? '';
      if (!content) {
        return fallback;
      }

      // Strip markdown code fences if present
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = singleMatchAnalysisSchema.safeParse(JSON.parse(cleaned));
      if (!parsed.success) {
        logger.warn('Wild Rift single match analysis failed schema validation', {
          issues: parsed.error.issues,
        });
        return fallback;
      }

      return {
        ...parsed.data,
        matchId: match.matchId,
      };
    } catch (error: any) {
      logger.warn('Wild Rift single match analysis failed, using fallback', {
        error: error?.message,
      });
      return fallback;
    }
  }

  private buildFallback(match: MatchStats): SingleMatchAnalysis {
    const deathsPenalty = Math.min(match.kda.deaths, 10) * 4;
    const baseScore = 70;
    const score = Math.max(0, Math.min(100, baseScore - deathsPenalty));

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (match.result === 'win') strengths.push('Converted advantages into a win');
    if (match.kda.assists >= 10) strengths.push('High teamfight participation');

    if (match.kda.deaths >= 8) improvements.push('Reduce deaths by improving positioning and timing');
    if (match.kda.kills === 0 && match.kda.assists < 5) improvements.push('Look for more proactive plays around objectives');

    return {
      matchId: match.matchId,
      summary: 'Fallback analysis (AI not configured or failed).',
      strengths,
      improvements,
      score,
    };
  }
}

export default new SingleMatchAnalysisService();
