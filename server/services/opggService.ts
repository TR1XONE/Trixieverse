/**
 * op.gg Wild Rift API Integration Service
 * Fetches real player stats from op.gg
 */

import axios, { AxiosInstance } from 'axios';

export interface WildRiftPlayer {
  name: string;
  tag: string;
  level: number;
  rank: string;
  rp: number;
  winRate: number;
  matchCount: number;
  champions: ChampionStats[];
  recentMatches: Match[];
  lastUpdated: Date;
}

export interface ChampionStats {
  name: string;
  tier: string;
  mastery: number;
  winRate: number;
  pickRate: number;
  matchCount: number;
}

export interface Match {
  id: string;
  champion: string;
  result: 'win' | 'loss';
  kda: string;
  duration: number;
  timestamp: Date;
}

export class OpggService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.op.gg/api/v1.0/wild-rift';
  private cacheMap: Map<string, { data: WildRiftPlayer; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'User-Agent': 'TrixieVerse/1.0',
      },
    });
  }

  /**
   * Search for a player by name and tag
   */
  async searchPlayer(gameName: string, tag: string): Promise<WildRiftPlayer | null> {
    try {
      const cacheKey = `${gameName}#${tag}`;
      
      // Check cache
      const cached = this.cacheMap.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }

      // Fetch from op.gg
      const response = await this.client.get(`/summoners/search`, {
        params: {
          query: `${gameName}#${tag}`,
        },
      });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const playerData = response.data[0];
      const player = this.parsePlayerData(playerData);

      // Cache the result
      this.cacheMap.set(cacheKey, {
        data: player,
        timestamp: Date.now(),
      });

      return player;
    } catch (error) {
      console.error('Error searching player:', error);
      return null;
    }
  }

  /**
   * Get player stats by summoner ID
   */
  async getPlayerStats(summonerId: string): Promise<WildRiftPlayer | null> {
    try {
      // Check cache
      const cached = this.cacheMap.get(summonerId);
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }

      // Fetch from op.gg
      const response = await this.client.get(`/summoners/${summonerId}`);

      if (!response.data) {
        return null;
      }

      const player = this.parsePlayerData(response.data);

      // Cache the result
      this.cacheMap.set(summonerId, {
        data: player,
        timestamp: Date.now(),
      });

      return player;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  /**
   * Get player's recent matches
   */
  async getRecentMatches(summonerId: string, limit: number = 10): Promise<Match[]> {
    try {
      const response = await this.client.get(`/summoners/${summonerId}/matches`, {
        params: {
          limit,
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((match: any) => this.parseMatchData(match));
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return [];
    }
  }

  /**
   * Get champion statistics for a player
   */
  async getChampionStats(summonerId: string): Promise<ChampionStats[]> {
    try {
      const response = await this.client.get(`/summoners/${summonerId}/champions`);

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((champ: any) => this.parseChampionData(champ));
    } catch (error) {
      console.error('Error fetching champion stats:', error);
      return [];
    }
  }

  /**
   * Get tier list for a specific role
   */
  async getTierList(role: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/meta/tier-list`, {
        params: {
          role,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Error fetching tier list:', error);
      return [];
    }
  }

  /**
   * Parse player data from op.gg response
   */
  private parsePlayerData(data: any): WildRiftPlayer {
    return {
      name: data.summonerName || 'Unknown',
      tag: data.tag || '',
      level: data.summonerLevel || 0,
      rank: data.tier || 'Unranked',
      rp: data.rp || 0,
      winRate: this.calculateWinRate(data.wins, data.losses),
      matchCount: (data.wins || 0) + (data.losses || 0),
      champions: data.champions ? data.champions.map((c: any) => this.parseChampionData(c)) : [],
      recentMatches: data.recentMatches ? data.recentMatches.map((m: any) => this.parseMatchData(m)) : [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Parse champion data from op.gg response
   */
  private parseChampionData(data: any): ChampionStats {
    return {
      name: data.championName || 'Unknown',
      tier: data.tier || 'Unranked',
      mastery: data.masteryLevel || 0,
      winRate: this.calculateWinRate(data.wins, data.losses),
      pickRate: data.pickRate || 0,
      matchCount: (data.wins || 0) + (data.losses || 0),
    };
  }

  /**
   * Parse match data from op.gg response
   */
  private parseMatchData(data: any): Match {
    const kills = data.kills || 0;
    const deaths = data.deaths || 0;
    const assists = data.assists || 0;

    return {
      id: data.matchId || '',
      champion: data.championName || 'Unknown',
      result: data.result === 'win' ? 'win' : 'loss',
      kda: `${kills}/${deaths}/${assists}`,
      duration: data.duration || 0,
      timestamp: new Date(data.timestamp || Date.now()),
    };
  }

  /**
   * Calculate win rate percentage
   */
  private calculateWinRate(wins: number = 0, losses: number = 0): number {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheMap.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cacheMap.size;
  }
}

export default new OpggService();
