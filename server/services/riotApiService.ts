/**
 * Riot Wild Rift API Service
 * Handles all communication with Riot's Wild Rift API
 * Documentation: https://developer.riotgames.com/docs/wild-rift
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from '../utils/logger';

// Rate limiter to respect Riot's limits
const RATE_LIMIT_MS = 100; // 100ms between requests

interface RiotPlayer {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface RiotRankedData {
  summonerId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

interface RiotMatch {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: RiotParticipant[];
    platformId: string;
    queueId: number;
    tournamentCode: string;
  };
}

interface RiotParticipant {
  allInPings: number;
  assistMePings: number;
  assists: number;
  baronKills: number;
  basicPings: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  championTransform: number;
  commandPings: number;
  consumablesPurchased: number;
  controlWardsPurchased: number;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  eligibleForProgression: boolean;
  enemyMissingPings: number;
  enemyVisionPings: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  goldEarned: number;
  goldSpent: number;
  holdPings: number;
  individualPosition: string;
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  missions: any;
  missingPings: number;
  needVisionPings: number;
  neutralMinionsKilled: number;
  nexusKills: number;
  nexusTakedowns: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  onMyWayPings: number;
  participantId: number;
  pentaKills: number;
  perksStats: any;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  profileIcon: number;
  pushPings: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: number;
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionClearedPings: number;
  visionScore: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
}

class RiotAPIService {
  private apiKey: string;
  private baseUrl = 'https://wr.api.riotgames.com';
  private client: AxiosInstance;
  private lastRequestTime = 0;

  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Riot-Token': this.apiKey,
      },
      timeout: 10000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 429) {
          logger.warn('Riot API rate limited', {
            retryAfter: error.response.headers['retry-after'],
          });
        } else if (error.response?.status === 404) {
          logger.debug('Riot API 404 - resource not found');
        } else {
          logger.error('Riot API error', {
            status: error.response?.status,
            message: error.message,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Rate limiter - respect Riot's rate limits
   * Prevents hitting rate limit caps
   */
  private async respectRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Get account by game name and tag
   * GET /api/account/v1/accounts/by-game-name/{gameName}/{tagLine}
   */
  async getAccountByGameName(gameName: string, tagLine: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('RIOT_API_KEY not configured');
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/account/v1/accounts/by-game-name/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get account by game name', {
        gameName,
        tagLine,
        status: error.response?.status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get match IDs by PUUID
   * GET /api/match-history/v1/matches/by-puuid/{puuid}/start/{start}/count/{count}
   */
  async getMatchIdsByPuuid(
    puuid: string,
    start = 0,
    count = 20
  ): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('RIOT_API_KEY not configured');
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/match-history/v1/matches/by-puuid/${puuid}/start/${start}/count/${count}`
      );

      return response.data || [];
    } catch (error: any) {
      logger.error('Failed to get match IDs', {
        puuid,
        status: error.response?.status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get match details by match ID
   * GET /api/match-history/v1/matches/{matchId}
   */
  async getMatchById(matchId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('RIOT_API_KEY not configured');
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/match-history/v1/matches/${matchId}`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get match details', {
        matchId,
        status: error.response?.status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get ranked stats by PUUID
   * GET /api/ranked/v1/ranked-stats/by-puuid/{puuid}
   */
  async getRankedStatsByPuuid(puuid: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('RIOT_API_KEY not configured');
    }

    try {
      await this.respectRateLimit();

      const response = await this.client.get(
        `/api/ranked/v1/ranked-stats/by-puuid/${puuid}`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get ranked stats', {
        puuid,
        status: error.response?.status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Health check - verify API connectivity and key validity
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('RIOT_API_KEY not configured');
      return false;
    }

    try {
      await this.respectRateLimit();
      // Simple request to verify connectivity and key validity
      await this.client.get('/');
      return true;
    } catch (error: any) {
      logger.warn('Riot API health check failed', {
        status: error.response?.status,
        error: error.message,
      });
      return false;
    }
  }
}

export default new RiotAPIService();
