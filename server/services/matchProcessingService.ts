/**
 * Match Processing Service
 * Converts Riot API match data to TrixieVerse format
 */

import { Database } from '../database/connection';
import riotApiService from './riotApiService';
import logger from '../utils/logger';

interface ProcessedMatch {
  riot_match_id: string;
  champion_id: number;
  champion_name: string;
  role: string;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  gold_earned: number;
  cs: number;
  duration_seconds: number;
  vision_score: number;
  damage_dealt_to_objectives: number;
  damage_dealt_to_buildings: number;
  first_blood_kill: boolean;
  first_blood_assist: boolean;
  first_tower_kill: boolean;
  first_tower_assist: boolean;
  largest_killing_spree: number;
  wards_placed: number;
  wards_killed: number;
  kda: string;
  match_timestamp: Date;
}

class MatchProcessingService {
  /**
   * Process Riot match data into app format
   */
  static processRiotMatch(
    riotMatch: any,
    userPuuid: string
  ): ProcessedMatch | null {
    try {
      // Find the user's participant data
      const userParticipant = riotMatch.info.participants.find(
        (p: any) => p.puuid === userPuuid
      );

      if (!userParticipant) {
        logger.warn('User not found in match participants', { userPuuid });
        return null;
      }

      const kda = `${userParticipant.kills}/${userParticipant.deaths}/${userParticipant.assists}`;
      const totalMinions =
        userParticipant.totalMinionsKilled +
        userParticipant.neutralMinionsKilled;

      return {
        riot_match_id: riotMatch.metadata.match_id,
        champion_id: userParticipant.championId,
        champion_name: userParticipant.championName,
        role: userParticipant.teamPosition || 'UNKNOWN',
        result: userParticipant.win ? 'win' : 'loss',
        kills: userParticipant.kills,
        deaths: userParticipant.deaths,
        assists: userParticipant.assists,
        gold_earned: userParticipant.goldEarned,
        cs: totalMinions,
        duration_seconds: Math.round(riotMatch.info.game_duration),
        vision_score: userParticipant.visionScore,
        damage_dealt_to_objectives:
          userParticipant.damageDealtToObjectives,
        damage_dealt_to_buildings:
          userParticipant.damageDealtToBuildings,
        first_blood_kill: userParticipant.firstBloodKill,
        first_blood_assist: userParticipant.firstBloodAssist,
        first_tower_kill: userParticipant.firstTowerKill,
        first_tower_assist: userParticipant.firstTowerAssist,
        largest_killing_spree: userParticipant.largestKillingSpree,
        wards_placed: userParticipant.wardsPlaced,
        wards_killed: userParticipant.wardsKilled,
        kda,
        match_timestamp: new Date(riotMatch.info.game_end_timestamp),
      };
    } catch (error) {
      logger.error('Failed to process Riot match', { error, userPuuid });
      return null;
    }
  }

  /**
   * Fetch and store matches for a user
   */
  static async fetchAndStoreMatches(
    db: Database,
    userId: string,
    accountId: string,
    puuid: string,
    limit = 10
  ): Promise<number> {
    try {
      // Get match IDs from Riot API
      const matchIds = await riotApiService.getMatchIdsByPuuid(
        puuid,
        0,
        limit
      );

      if (!matchIds || matchIds.length === 0) {
        logger.info('No matches found for user', { userId, puuid });
        return 0;
      }

      let insertedCount = 0;

      // Process each match
      for (const matchId of matchIds) {
        try {
          // Check if match already stored
          const existingMatch = await db.query(
            'SELECT id FROM matches WHERE riot_match_id = $1 AND user_id = $2',
            [matchId, userId]
          );

          if (existingMatch.rows.length > 0) {
            logger.debug('Match already stored', { matchId });
            continue;
          }

          // Fetch match details from Riot
          const riotMatch = await riotApiService.getMatchById(matchId);

          // Process match data
          const processedMatch = this.processRiotMatch(riotMatch, puuid);

          if (!processedMatch) {
            logger.warn('Failed to process match', { matchId });
            continue;
          }

          // Store in database
          const insertResult = await db.query(
            `INSERT INTO matches (
              user_id, player_account_id, riot_match_id, champion_name,
              role, result, kills, deaths, assists, gold_earned, cs,
              duration_seconds, vision_score, damage_dealt_to_objectives,
              damage_dealt_to_buildings, first_blood_kill, first_blood_assist,
              first_tower_kill, first_tower_assist, largest_killing_spree,
              wards_placed, wards_killed, kda, match_timestamp
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
              $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
            ) RETURNING id`,
            [
              userId,
              accountId,
              processedMatch.riot_match_id,
              processedMatch.champion_name,
              processedMatch.role,
              processedMatch.result,
              processedMatch.kills,
              processedMatch.deaths,
              processedMatch.assists,
              processedMatch.gold_earned,
              processedMatch.cs,
              processedMatch.duration_seconds,
              processedMatch.vision_score,
              processedMatch.damage_dealt_to_objectives,
              processedMatch.damage_dealt_to_buildings,
              processedMatch.first_blood_kill,
              processedMatch.first_blood_assist,
              processedMatch.first_tower_kill,
              processedMatch.first_tower_assist,
              processedMatch.largest_killing_spree,
              processedMatch.wards_placed,
              processedMatch.wards_killed,
              processedMatch.kda,
              processedMatch.match_timestamp,
            ]
          );

          if (insertResult.rows.length > 0) {
            insertedCount++;
            logger.info('Match stored', { matchId, userId });
          }
        } catch (error) {
          logger.error('Failed to process individual match', {
            matchId,
            error,
          });
          continue;
        }
      }

      logger.info('Match fetching completed', {
        userId,
        insertedCount,
        totalMatches: matchIds.length,
      });
      return insertedCount;
    } catch (error) {
      logger.error('Failed to fetch and store matches', { userId, error });
      throw error;
    }
  }
}

export default MatchProcessingService;
