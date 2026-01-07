/**
 * Gamification Service
 * Handles achievements, badges, streaks, XP, and leaderboards
 */

import db from '../database/connection.js';

interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  unlockedAt: Date;
}

interface Badge {
  type: 'skill' | 'milestone' | 'community' | 'seasonal';
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
}

class GamificationService {
  /**
   * Award achievement
   */
  async awardAchievement(
    userId: string,
    achievementType: string,
    data: {
      title: string;
      description: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      iconUrl: string;
    }
  ): Promise<Achievement> {
    try {
      // Check if already unlocked
      const existing = await db.query(
        `SELECT id FROM achievements 
         WHERE user_id = $1 AND achievement_type = $2`,
        [userId, achievementType]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      // Award achievement
      const result = await db.query(
        `INSERT INTO achievements 
         (user_id, achievement_type, title, description, rarity, icon_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, achievementType, data.title, data.description, data.rarity, data.iconUrl]
      );

      // Award XP based on rarity
      const xpReward = {
        common: 10,
        rare: 25,
        epic: 50,
        legendary: 100,
      }[data.rarity];

      await this.addXP(userId, xpReward);

      return result.rows[0];
    } catch (error) {
      console.error('Award achievement error:', error);
      throw error;
    }
  }

  /**
   * Add XP to user
   */
  async addXP(userId: string, amount: number): Promise<number> {
    try {
      // Get current level and XP
      const result = await db.query(
        `SELECT 
           COALESCE((SELECT SUM(CAST(analysis_data->>'performanceScore' AS FLOAT)) FROM matches WHERE user_id = $1), 0) as total_xp
         FROM users WHERE id = $1`,
        [userId]
      );

      const totalXP = (result.rows[0]?.total_xp || 0) + amount;
      const level = Math.floor(totalXP / 100) + 1;

      return totalXP;
    } catch (error) {
      console.error('Add XP error:', error);
      throw error;
    }
  }

  /**
   * Get user level
   */
  async getUserLevel(userId: string): Promise<{ level: number; xp: number; nextLevelXP: number }> {
    try {
      const result = await db.query(
        `SELECT 
           COALESCE(SUM(CAST(analysis_data->>'performanceScore' AS FLOAT)), 0) as total_xp
         FROM matches WHERE user_id = $1`,
        [userId]
      );

      const totalXP = result.rows[0]?.total_xp || 0;
      const level = Math.floor(totalXP / 100) + 1;
      const nextLevelXP = level * 100;
      const currentLevelXP = (level - 1) * 100;
      const xpInLevel = totalXP - currentLevelXP;

      return {
        level,
        xp: xpInLevel,
        nextLevelXP: nextLevelXP - currentLevelXP,
      };
    } catch (error) {
      console.error('Get user level error:', error);
      throw error;
    }
  }

  /**
   * Track win streak
   */
  async updateWinStreak(userId: string, playerAccountId: string, isWin: boolean): Promise<number> {
    try {
      // Get last 5 matches
      const result = await db.query(
        `SELECT result FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT 5`,
        [userId, playerAccountId]
      );

      if (!isWin) {
        return 0;
      }

      let streak = 0;
      for (const match of result.rows) {
        if (match.result === 'win') {
          streak++;
        } else {
          break;
        }
      }

      // Award badge for streaks
      if (streak === 3) {
        await this.awardAchievement(userId, 'win_streak_3', {
          title: '3-Win Streak',
          description: 'Won 3 matches in a row',
          rarity: 'common',
          iconUrl: '🔥',
        });
      } else if (streak === 5) {
        await this.awardAchievement(userId, 'win_streak_5', {
          title: '5-Win Streak',
          description: 'Won 5 matches in a row',
          rarity: 'rare',
          iconUrl: '🔥🔥',
        });
      } else if (streak === 10) {
        await this.awardAchievement(userId, 'win_streak_10', {
          title: '10-Win Streak',
          description: 'Won 10 matches in a row',
          rarity: 'epic',
          iconUrl: '🔥🔥🔥',
        });
      }

      return streak;
    } catch (error) {
      console.error('Update win streak error:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    limit: number = 100,
    timeframe: 'week' | 'month' | 'all' = 'month'
  ): Promise<any[]> {
    try {
      const timeframeSQL = {
        week: "AND m.match_timestamp > NOW() - INTERVAL '7 days'",
        month: "AND m.match_timestamp > NOW() - INTERVAL '30 days'",
        all: '',
      }[timeframe];

      const result = await db.query(
        `SELECT 
           u.id,
           u.username,
           COUNT(m.id) as matches_played,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(m.id) * 100 as win_rate,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           COUNT(a.id) as achievements_unlocked,
           ROW_NUMBER() OVER (ORDER BY AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) DESC) as rank
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id ${timeframeSQL}
         LEFT JOIN achievements a ON u.id = a.user_id
         GROUP BY u.id, u.username
         HAVING COUNT(m.id) > 0
         ORDER BY avg_performance DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  /**
   * Get user rank
   */
  async getUserRank(userId: string, timeframe: 'week' | 'month' | 'all' = 'month'): Promise<number> {
    try {
      const timeframeSQL = {
        week: "AND m.match_timestamp > NOW() - INTERVAL '7 days'",
        month: "AND m.match_timestamp > NOW() - INTERVAL '30 days'",
        all: '',
      }[timeframe];

      const result = await db.query(
        `SELECT rank FROM (
           SELECT 
             u.id,
             ROW_NUMBER() OVER (ORDER BY AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) DESC) as rank
           FROM users u
           LEFT JOIN matches m ON u.id = m.user_id ${timeframeSQL}
           GROUP BY u.id
           HAVING COUNT(m.id) > 0
         ) ranked
         WHERE id = $1`,
        [userId]
      );

      return result.rows[0]?.rank || 0;
    } catch (error) {
      console.error('Get user rank error:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const result = await db.query(
        `SELECT * FROM achievements 
         WHERE user_id = $1
         ORDER BY unlocked_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get user achievements error:', error);
      throw error;
    }
  }

  /**
   * Get badges progress
   */
  async getBadgesProgress(userId: string): Promise<Badge[]> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const level = await this.getUserLevel(userId);

      const badges: Badge[] = [
        {
          type: 'skill',
          title: 'Skill Master',
          description: 'Reach 100 performance score',
          icon: '⭐',
          progress: Math.min(level.level * 10, 100),
          maxProgress: 100,
        },
        {
          type: 'milestone',
          title: 'Match Veteran',
          description: 'Play 100 matches',
          icon: '🎮',
          progress: Math.min(achievements.length * 5, 100),
          maxProgress: 100,
        },
        {
          type: 'community',
          title: 'Community Hero',
          description: 'Help 10 players improve',
          icon: '💜',
          progress: 0,
          maxProgress: 100,
        },
        {
          type: 'seasonal',
          title: 'Season Champion',
          description: 'Reach top 10 in season',
          icon: '👑',
          progress: 0,
          maxProgress: 100,
        },
      ];

      return badges;
    } catch (error) {
      console.error('Get badges progress error:', error);
      throw error;
    }
  }

  /**
   * Check and award milestone achievements
   */
  async checkMilestones(userId: string, playerAccountId: string): Promise<Achievement[]> {
    try {
      const awarded: Achievement[] = [];

      // Get match count
      const matchResult = await db.query(
        `SELECT COUNT(*) as count FROM matches WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );

      const matchCount = matchResult.rows[0].count;

      // Check milestones
      const milestones = [
        { count: 1, achievement: 'first_match', title: 'First Step', rarity: 'common' as const },
        { count: 10, achievement: 'ten_matches', title: 'Getting Started', rarity: 'common' as const },
        { count: 50, achievement: 'fifty_matches', title: 'Dedicated Player', rarity: 'rare' as const },
        { count: 100, achievement: 'hundred_matches', title: 'Veteran', rarity: 'epic' as const },
        { count: 500, achievement: 'five_hundred_matches', title: 'Legend', rarity: 'legendary' as const },
      ];

      for (const milestone of milestones) {
        if (matchCount >= milestone.count) {
          const achievement = await this.awardAchievement(userId, milestone.achievement, {
            title: milestone.title,
            description: `Played ${milestone.count} matches`,
            rarity: milestone.rarity,
            iconUrl: '🏆',
          });

          awarded.push(achievement);
        }
      }

      return awarded;
    } catch (error) {
      console.error('Check milestones error:', error);
      throw error;
    }
  }
}

export default new GamificationService();
