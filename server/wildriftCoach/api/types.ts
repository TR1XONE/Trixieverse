import type { MatchStats } from '../models/MatchStats';

export interface IngestMatchRequestBody {
  match: MatchStats;
}

export interface TrendRequestBody {
  puuid: string;
  matches: MatchStats[];
  windowSize?: number;
}
