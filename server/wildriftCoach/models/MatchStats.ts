export type MatchResult = 'win' | 'loss';

export interface PlayerKDA {
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchStats {
  matchId: string;
  puuid: string;
  championName?: string;
  role?: string;
  result: MatchResult;
  kda: PlayerKDA;
  goldEarned?: number;
  damageDealt?: number;
  durationSeconds?: number;
  timestamp?: number;
}
