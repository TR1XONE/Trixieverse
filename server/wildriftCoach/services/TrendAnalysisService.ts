import type { MatchStats } from '../models/MatchStats';
import type { PlayerTrend, TrendMetric } from '../models/PlayerTrend';
import { z } from 'zod';
import logger from '../../utils/logger';
import { getGeminiClient, getGeminiModel } from './geminiClient';

export interface TrendAnalysisInput {
  puuid: string;
  matches: MatchStats[];
  windowSize?: number;
}

export class TrendAnalysisService {
  async analyze(input: TrendAnalysisInput): Promise<PlayerTrend> {
    const fallback = this.buildFallback(input);

    try {
      const ai = getGeminiClient();
      const modelName = getGeminiModel();

      const prompt = `You are a Wild Rift coach. Return ONLY valid JSON, no markdown, no extra keys.
Analyze player trends across these recent matches:
Schema: { "puuid": string, "windowSize": number, "summary": { "winRate": number, "avgKDA": number }, "metrics": [{"name": string, "value": number}], "recentMatches": [] }
puuid: "${input.puuid}"
windowSize: ${input.windowSize ?? input.matches.length}
Matches: ${JSON.stringify(input.matches)}`;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      const content = result.text ?? '';
      if (!content) return fallback;

      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

      const parsed = playerTrendSchema.safeParse(JSON.parse(cleaned));
      if (!parsed.success) {
        logger.warn('Wild Rift trend analysis failed schema validation', {
          issues: parsed.error.issues,
        });
        return fallback;
      }

      return {
        ...parsed.data,
        puuid: input.puuid,
        windowSize: input.windowSize ?? parsed.data.windowSize,
        recentMatches: input.matches.slice(0, input.windowSize ?? input.matches.length),
      };
    } catch (error: any) {
      logger.warn('Wild Rift trend analysis failed, using fallback', {
        error: error?.message,
      });
      return fallback;
    }
  }

  private buildFallback(input: TrendAnalysisInput): PlayerTrend {
    const windowSize = input.windowSize ?? input.matches.length;
    const recentMatches = input.matches.slice(0, windowSize);

    const wins = recentMatches.filter((m) => m.result === 'win').length;
    const winRate = recentMatches.length ? wins / recentMatches.length : 0;

    const avgKDA = recentMatches.length
      ? recentMatches.reduce((acc, m) => acc + (m.kda.kills + m.kda.assists) / Math.max(1, m.kda.deaths), 0) /
      recentMatches.length
      : 0;

    const metrics: TrendMetric[] = [
      { name: 'winRate', value: winRate },
      { name: 'avgKDA', value: avgKDA },
    ];

    return {
      puuid: input.puuid,
      windowSize,
      summary: {
        winRate,
        avgKDA,
      },
      metrics,
      recentMatches,
    };
  }
}

export default new TrendAnalysisService();

const trendMetricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  delta: z.number().optional(),
});

const playerTrendSchema = z.object({
  puuid: z.string().min(1),
  windowSize: z.number().int().min(1),
  fromTimestamp: z.number().optional(),
  toTimestamp: z.number().optional(),
  summary: z.object({
    winRate: z.number().min(0).max(1).optional(),
    avgKDA: z.number().optional(),
    avgGold: z.number().optional(),
    avgDamage: z.number().optional(),
  }),
  metrics: z.array(trendMetricSchema).max(25),
  recentMatches: z.array(z.any()),
});
