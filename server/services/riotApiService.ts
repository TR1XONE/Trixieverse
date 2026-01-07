/**
 * Riot Games API Service
 * Integrates with Riot API for Wild Rift data
 * Falls back to op.gg if Riot API is unavailable
 */

import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

class RiotApiService {
  private riotClient: AxiosInstance;
  private apiKey: string;
  private baseUrl = 'https://americas.api.riotgames.com';
  private wildriftRegion = 'na1'; // Wild Rift region

  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';

    this.riotClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    });
  }

  /**
   * Search for a player by game name and tag
   */
  async searchPlayer(gameName: string, tag: string): Promise<RiotPlayer | null> {
    try {
      if (!this.apiKey) {
        console.warn('Riot API key not configured');
        return null;
      }

      const response = await this.riotClient.get('/riot/account/v1/accounts/by-riot-id', {
        params: {
          gameName,
          tagLine: tag,
        },
      });

      return response.data;
    } catch (error) {
      console.warn('Riot API search player error:', error);
      return null;
    }
  }

  /**
   * Get player ranked data
   */
  async getPlayerRankedData(summonerId: string): Promise<RiotRankedData | null> {
    try {
      if (!this.apiKey) {
        console.warn('Riot API key not configured');
        return null;
      }

      const response = await this.riotClient.get(
        `/lol/league/v4/entries/by-summoner/${summonerId}`,
        {
          baseURL: `https://${this.wildriftRegion}.api.riotgames.com`,
        }
      );

      // Return solo queue data
      return response.data.find((entry: RiotRankedData) => entry.queueType === 'RANKED_SOLO_5x5') || response.data[0];
    } catch (error) {
      console.warn('Riot API get ranked data error:', error);
      return null;
    }
  }

  /**
   * Get recent matches
   */
  async getRecentMatches(puuid: string, count: number = 20): Promise<string[] | null> {
    try {
      if (!this.apiKey) {
        console.warn('Riot API key not configured');
        return null;
      }

      const response = await this.riotClient.get(
        `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
          params: {
            start: 0,
            count,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.warn('Riot API get recent matches error:', error);
      return null;
    }
  }

  /**
   * Get match details
   */
  async getMatchDetails(matchId: string): Promise<RiotMatch | null> {
    try {
      if (!this.apiKey) {
        console.warn('Riot API key not configured');
        return null;
      }

      const response = await this.riotClient.get(`/lol/match/v5/matches/${matchId}`);

      return response.data;
    } catch (error) {
      console.warn('Riot API get match details error:', error);
      return null;
    }
  }

  /**
   * Check if API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      // Try a simple request to check if API is available
      await this.riotClient.get('/riot/account/v1/accounts/by-riot-id', {
        params: {
          gameName: 'test',
          tagLine: 'test',
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new RiotApiService();
