import type { MatchStats } from '../models/MatchStats';
import type { PlayerTrend, TrendMetric } from '../models/PlayerTrend';
import { z } from 'zod';
import logger from '../../utils/logger';
import { getOpenAIClient, getOpenAIModel } from './openaiClient';

export interface TrendAnalysisInput {
  puuid: string;
  matches: MatchStats[];
  windowSize?: number;
}

export class TrendAnalysisService {
  async analyze(input: TrendAnalysisInput): Promise<PlayerTrend> {
    const fallback = this.buildFallback(input);

    try {
      const openai = getOpenAIClient();
      const model = getOpenAIModel();

      const system =
        'You are a Wild Rift coach. Return only valid JSON. No markdown. No extra keys.';

      const user = {
        instruction:
          'Analyze player trends across the recent matches. Identify key metrics and provide a concise summary for coaching.',
        puuid: input.puuid,
        windowSize: input.windowSize ?? input.matches.length,
        matches: input.matches,
        output: {
          puuid: 'string',
          windowSize: 'number',
          summary: {
            winRate: 'number (0-1)',
            avgKDA: 'number',
            avgGold: 'number (optional)',
            avgDamage: 'number (optional)',
          },
          metrics: [{ name: 'string', value: 'number', delta: 'number (optional)' }],
          recentMatches: 'array of matches (can be empty)'
        },
      };

      const response = await openai.chat.completions.create({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(user) },
        ],
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) return fallback;

      const parsed = playerTrendSchema.safeParse(JSON.parse(content));
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
