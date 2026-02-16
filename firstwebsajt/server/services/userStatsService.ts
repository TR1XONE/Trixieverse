/**
 * User Stats Service
 * Calculates and updates user statistics from match data
 */

import db from '../database/connection';
import logger from '../utils/logger';

interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  winRate: number;
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  lastMatchDeaths: number;
  lastMatchKills: number;
  lastMatchDamage: number;
  bestChampionWinRate: number;
  bestChampionMatches: number;
  averageKDA: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
}

class UserStatsService {
  /**
   * Calculate user statistics from match history
   */
  async calculateUserStats(userId: string): Promise<UserStats> {
    try {
      // Get all matches for user
      const matchesResult = await db.query(
        `SELECT 
           result, kills, deaths, assists, damage_dealt, champion_name
         FROM matches
         WHERE user_id = $1
         ORDER BY match_timestamp DESC`,
        [userId]
      );

      const matches = matchesResult.rows;

      if (matches.length === 0) {
        return {
          totalWins: 0,
          totalLosses: 0,
          totalMatches: 0,
          winRate: 0,
          currentWinStreak: 0,
          currentLossStreak: 0,
          longestWinStreak: 0,
          lastMatchDeaths: 0,
          lastMatchKills: 0,
          lastMatchDamage: 0,
          bestChampionWinRate: 0,
          bestChampionMatches: 0,
          averageKDA: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
        };
      }

      // Calculate basic stats
      const totalWins = matches.filter((m) => m.result === 'win').length;
      const totalLosses = matches.filter((m) => m.result === 'loss').length;
      const totalMatches = matches.length;
      const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

      // Calculate streaks
      let currentWinStreak = 0;
      let currentLossStreak = 0;
      let longestWinStreak = 0;
      let tempWinStreak = 0;

      for (const match of matches) {
        if (match.result === 'win') {
          currentWinStreak++;
          tempWinStreak++;
          if (tempWinStreak > longestWinStreak) {
            longestWinStreak = tempWinStreak;
          }
          currentLossStreak = 0;
        } else {
          currentLossStreak++;
          tempWinStreak = 0;
          currentWinStreak = 0;
        }
      }

      // Get last match stats
      const lastMatch = matches[0];
      const lastMatchDeaths = lastMatch.deaths || 0;
      const lastMatchKills = lastMatch.kills || 0;
      const lastMatchDamage = lastMatch.damage_dealt || 0;

      // Calculate total KDA
      const totalKills = matches.reduce((sum, m) => sum + (m.kills || 0), 0);
      const totalDeaths = matches.reduce((sum, m) => sum + (m.deaths || 0), 0);
      const totalAssists = matches.reduce((sum, m) => sum + (m.assists || 0), 0);
      const averageKDA = totalMatches > 0 ? (totalKills + totalAssists) / Math.max(totalDeaths, 1) : 0;

      // Calculate best champion stats
      const championStats: { [key: string]: { wins: number; total: number } } = {};
      for (const match of matches) {
        const champion = match.champion_name;
        if (!championStats[champion]) {
          championStats[champion] = { wins: 0, total: 0 };
        }
        championStats[champion].total++;
        if (match.result === 'win') {
          championStats[champion].wins++;
        }
      }

      let bestChampionWinRate = 0;
      let bestChampionMatches = 0;
      for (const champion in championStats) {
        const stats = championStats[champion];
        if (stats.total >= 5) {
          // Only consider champions with 5+ matches
          const winRate = (stats.wins / stats.total) * 100;
          if (winRate > bestChampionWinRate) {
            bestChampionWinRate = winRate;
            bestChampionMatches = stats.total;
          }
        }
      }

      return {
        totalWins,
        totalLosses,
        totalMatches,
        winRate: Math.round(winRate * 100) / 100,
        currentWinStreak,
        currentLossStreak,
        longestWinStreak,
        lastMatchDeaths,
        lastMatchKills,
        lastMatchDamage,
        bestChampionWinRate: Math.round(bestChampionWinRate * 100) / 100,
        bestChampionMatches,
        averageKDA: Math.round(averageKDA * 100) / 100,
        totalKills,
        totalDeaths,
        totalAssists,
      };
    } catch (error) {
      logger.error({ message: 'Error calculating user stats', error });
      throw error;
    }
  }

  /**
   * Get user stats from cache or calculate if needed
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      return await this.calculateUserStats(userId);
    } catch (error) {
      logger.error({ message: 'Error getting user stats', error });
      throw error;
    }
  }

  /**
   * Add a match and recalculate stats
   */
  async addMatchAndUpdateStats(
    userId: string,
    playerAccountId: string,
    matchData: {
      champion_name: string;
      role: string;
      result: 'win' | 'loss';
      kills: number;
      deaths: number;
      assists: number;
      damage_dealt: number;
      gold_earned: number;
      cs: number;
      duration_seconds: number;
      match_timestamp: Date;
    }
  ): Promise<{ match: any; stats: UserStats; newAchievements: any[] }> {
    try {
      // Insert match
      const matchResult = await db.query(
        `INSERT INTO matches (
           user_id, player_account_id, champion_name, role, result, 
           kills, deaths, assists, damage_dealt, gold_earned, cs, 
           duration_seconds, match_timestamp, analyzed
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false)
         RETURNING *`,
        [
          userId,
          playerAccountId,
          matchData.champion_name,
          matchData.role,
          matchData.result,
          matchData.kills,
          matchData.deaths,
          matchData.assists,
          matchData.damage_dealt,
          matchData.gold_earned,
          matchData.cs,
          matchData.duration_seconds,
          matchData.match_timestamp,
        ]
      );

      const match = matchResult.rows[0];

      // Recalculate stats
      const stats = await this.calculateUserStats(userId);

      // Import achievement service to check for new achievements
      const achievementService = (await import('./achievementTrackingService')).default;
      const newAchievements = await achievementService.checkAndUnlockAchievements(userId, stats);

      logger.info(`Match added for user ${userId}: ${matchData.result}`);

      return {
        match,
        stats,
        newAchievements,
      };
    } catch (error) {
      logger.error({ message: 'Error adding match and updating stats', error });
      throw error;
    }
  }
}

export default new UserStatsService();
