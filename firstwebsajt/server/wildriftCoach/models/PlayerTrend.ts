import type { MatchStats } from './MatchStats';

export interface TrendMetric {
  name: string;
  value: number;
  delta?: number;
}

export interface PlayerTrend {
  puuid: string;
  windowSize: number;
  fromTimestamp?: number;
  toTimestamp?: number;
  summary: {
    winRate?: number;
    avgKDA?: number;
    avgGold?: number;
    avgDamage?: number;
  };
  metrics: TrendMetric[];
  recentMatches: MatchStats[];
}
