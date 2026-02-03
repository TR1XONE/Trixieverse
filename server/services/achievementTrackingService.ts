/**
 * Achievement Tracking Service
 * Handles unlocking, tracking, and managing player achievements
 */

import db from '../database/connection';
import logger from '../utils/logger';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  rarity: string;
  icon_url: string;
  unlocked_at: Date;
  created_at: Date;
}

interface AchievementDefinition {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  rarity: string;
  icon_url: string;
  condition: (userData: any) => boolean;
}

class AchievementTrackingService {
  /**
   * Achievement definitions
   */
  private achievements: AchievementDefinition[] = [
    {
      id: 'first_win',
      achievement_type: 'milestone',
      title: 'First Victory',
      description: 'Win your first match',
      rarity: 'common',
      icon_url: '/achievements/first-win.png',
      condition: (data) => data.totalWins >= 1,
    },
    {
      id: 'win_streak_5',
      achievement_type: 'skill',
      title: 'On Fire',
      description: 'Win 5 matches in a row',
      rarity: 'rare',
      icon_url: '/achievements/win-streak-5.png',
      condition: (data) => data.currentWinStreak >= 5,
    },
    {
      id: 'win_streak_10',
      achievement_type: 'skill',
      title: 'Unstoppable',
      description: 'Win 10 matches in a row',
      rarity: 'epic',
      icon_url: '/achievements/win-streak-10.png',
      condition: (data) => data.currentWinStreak >= 10,
    },
    {
      id: 'perfect_kda',
      achievement_type: 'skill',
      title: 'Flawless',
      description: 'Achieve a perfect KDA (no deaths) in a match',
      rarity: 'rare',
      icon_url: '/achievements/perfect-kda.png',
      condition: (data) => data.lastMatchDeaths === 0 && data.lastMatchKills > 0,
    },
    {
      id: 'high_damage',
      achievement_type: 'skill',
      title: 'Damage Dealer',
      description: 'Deal over 10,000 damage in a single match',
      rarity: 'rare',
      icon_url: '/achievements/high-damage.png',
      condition: (data) => data.lastMatchDamage > 10000,
    },
    {
      id: 'total_wins_10',
      achievement_type: 'milestone',
      title: 'Rookie',
      description: 'Achieve 10 total wins',
      rarity: 'common',
      icon_url: '/achievements/10-wins.png',
      condition: (data) => data.totalWins >= 10,
    },
    {
      id: 'total_wins_50',
      achievement_type: 'milestone',
      title: 'Veteran',
      description: 'Achieve 50 total wins',
      rarity: 'rare',
      icon_url: '/achievements/50-wins.png',
      condition: (data) => data.totalWins >= 50,
    },
    {
      id: 'total_wins_100',
      achievement_type: 'milestone',
      title: 'Legend',
      description: 'Achieve 100 total wins',
      rarity: 'epic',
      icon_url: '/achievements/100-wins.png',
      condition: (data) => data.totalWins >= 100,
    },
    {
      id: 'high_win_rate',
      achievement_type: 'skill',
      title: 'Consistent Winner',
      description: 'Maintain a 60% win rate over 20 matches',
      rarity: 'epic',
      icon_url: '/achievements/high-win-rate.png',
      condition: (data) => data.winRate >= 60 && data.totalMatches >= 20,
    },
    {
      id: 'champion_mastery',
      achievement_type: 'skill',
      title: 'Champion Master',
      description: 'Achieve 70% win rate with a single champion',
      rarity: 'legendary',
      icon_url: '/achievements/champion-master.png',
      condition: (data) => data.bestChampionWinRate >= 70 && data.bestChampionMatches >= 10,
    },
  ];

  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const result = await db.query(
        `SELECT id, user_id, achievement_type, title, description, rarity, icon_url, unlocked_at, created_at
         FROM achievements
         WHERE user_id = $1
         ORDER BY unlocked_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      logger.error({ message: 'Error fetching user achievements', error });
      throw error;
    }
  }

  /**
   * Check and unlock achievements for a user
   */
  async checkAndUnlockAchievements(userId: string, userData: any): Promise<Achievement[]> {
    try {
      const unlockedAchievements: Achievement[] = [];

      // Get already unlocked achievements
      const existingResult = await db.query(
        'SELECT achievement_type FROM achievements WHERE user_id = $1',
        [userId]
      );
      const unlockedTypes = new Set(existingResult.rows.map((row) => row.achievement_type));

      // Check each achievement definition
      for (const achievementDef of this.achievements) {
        // Skip if already unlocked
        if (unlockedTypes.has(achievementDef.id)) {
          continue;
        }

        // Check if condition is met
        if (achievementDef.condition(userData)) {
          // Unlock achievement
          const insertResult = await db.query(
            `INSERT INTO achievements (user_id, achievement_type, title, description, rarity, icon_url, unlocked_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING id, user_id, achievement_type, title, description, rarity, icon_url, unlocked_at, created_at`,
            [userId, achievementDef.id, achievementDef.title, achievementDef.description, achievementDef.rarity, achievementDef.icon_url]
          );

          unlockedAchievements.push(insertResult.rows[0]);
          logger.info(`Achievement unlocked: ${achievementDef.title} for user ${userId}`);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      logger.error({ message: 'Error checking achievements', error });
      throw error;
    }
  }

  /**
   * Get achievement statistics for a user
   */
  async getAchievementStats(userId: string): Promise<any> {
    try {
      const result = await db.query(
        `SELECT 
           COUNT(*) as total_achievements,
           COUNT(CASE WHEN rarity = 'common' THEN 1 END) as common_count,
           COUNT(CASE WHEN rarity = 'rare' THEN 1 END) as rare_count,
           COUNT(CASE WHEN rarity = 'epic' THEN 1 END) as epic_count,
           COUNT(CASE WHEN rarity = 'legendary' THEN 1 END) as legendary_count,
           COUNT(CASE WHEN achievement_type = 'skill' THEN 1 END) as skill_achievements,
           COUNT(CASE WHEN achievement_type = 'milestone' THEN 1 END) as milestone_achievements,
           COUNT(CASE WHEN achievement_type = 'community' THEN 1 END) as community_achievements,
           COUNT(CASE WHEN achievement_type = 'seasonal' THEN 1 END) as seasonal_achievements
         FROM achievements
         WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || {
        total_achievements: 0,
        common_count: 0,
        rare_count: 0,
        epic_count: 0,
        legendary_count: 0,
        skill_achievements: 0,
        milestone_achievements: 0,
        community_achievements: 0,
        seasonal_achievements: 0,
      };
    } catch (error) {
      logger.error({ message: 'Error fetching achievement stats', error });
      throw error;
    }
  }

  /**
   * Manually unlock an achievement (for testing or admin purposes)
   */
  async unlockAchievementManually(userId: string, achievementId: string): Promise<Achievement> {
    try {
      const achievementDef = this.achievements.find((a) => a.id === achievementId);
      if (!achievementDef) {
        throw new Error('Achievement not found');
      }

      const result = await db.query(
        `INSERT INTO achievements (user_id, achievement_type, title, description, rarity, icon_url, unlocked_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING
         RETURNING id, user_id, achievement_type, title, description, rarity, icon_url, unlocked_at, created_at`,
        [userId, achievementDef.id, achievementDef.title, achievementDef.description, achievementDef.rarity, achievementDef.icon_url]
      );

      if (result.rows.length === 0) {
        throw new Error('Achievement already unlocked');
      }

      return result.rows[0];
    } catch (error) {
      logger.error({ message: 'Error unlocking achievement manually', error });
      throw error;
    }
  }

  /**
   * Get leaderboard of users by achievement count
   */
  async getAchievementLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const result = await db.query(
        `SELECT 
           u.id,
           u.username,
           COUNT(a.id) as achievement_count,
           COUNT(CASE WHEN a.rarity = 'legendary' THEN 1 END) as legendary_count,
           COUNT(CASE WHEN a.rarity = 'epic' THEN 1 END) as epic_count
         FROM users u
         LEFT JOIN achievements a ON u.id = a.user_id
         GROUP BY u.id, u.username
         ORDER BY achievement_count DESC, legendary_count DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      logger.error({ message: 'Error fetching achievement leaderboard', error });
      throw error;
    }
  }
}

export default new AchievementTrackingService();
