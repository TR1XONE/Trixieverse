/**
 * Skill Profile Service
 * Calculates and manages the 5D Skill Radar
 */

import db from '../database/connection';

export interface SkillProfile {
  mechanicsScore: number;
  macroPlayScore: number;
  decisionMakingScore: number;
  consistencyScore: number;
  clutchFactorScore: number;
  overallRating: number;
  trend: 'improving' | 'stable' | 'declining';
  matchesAnalyzed: number;
}

class SkillProfileService {
  /**
   * Get skill profile for a player
   */
  async getSkillProfile(userId: string, playerAccountId: string): Promise<SkillProfile | null> {
    try {
      const result = await db.query(
        `SELECT 
           mechanics_score as "mechanicsScore",
           macro_play_score as "macroPlayScore",
           decision_making_score as "decisionMakingScore",
           consistency_score as "consistencyScore",
           clutch_factor_score as "clutchFactorScore",
           overall_rating as "overallRating",
           trend,
           matches_analyzed as "matchesAnalyzed"
         FROM skill_profiles 
         WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get skill profile error:', error);
      throw error;
    }
  }

  /**
   * Calculate trend based on recent matches
   */
  async calculateTrend(userId: string, playerAccountId: string): Promise<'improving' | 'stable' | 'declining'> {
    try {
      // Get last 10 matches
      const result = await db.query(
        `SELECT analysis_data FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT 10`,
        [userId, playerAccountId]
      );

      if (result.rows.length < 3) {
        return 'stable';
      }

      // Calculate average performance score for first 5 and last 5 matches
      const scores = result.rows
        .map((row: any) => {
          try {
            return JSON.parse(row.analysis_data).performanceScore;
          } catch {
            return 50;
          }
        });

      const oldAvg = scores.slice(5).reduce((a: number, b: number) => a + b, 0) / Math.max(scores.slice(5).length, 1);
      const newAvg = scores.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5;

      const difference = newAvg - oldAvg;

      if (difference > 5) return 'improving';
      if (difference < -5) return 'declining';
      return 'stable';
    } catch (error) {
      console.error('Calculate trend error:', error);
      return 'stable';
    }
  }

  /**
   * Get skill breakdown by role
   */
  async getSkillByRole(userId: string, playerAccountId: string) {
    try {
      const result = await db.query(
        `SELECT 
           role,
           COUNT(*) as match_count,
           AVG(CAST(analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate
         FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         GROUP BY role
         ORDER BY match_count DESC`,
        [userId, playerAccountId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get skill by role error:', error);
      throw error;
    }
  }

  /**
   * Get skill breakdown by champion
   */
  async getSkillByChampion(userId: string, playerAccountId: string, limit: number = 10) {
    try {
      const result = await db.query(
        `SELECT 
           champion_name,
           match_count,
           win_rate,
           average_kda,
           total_kills,
           total_deaths,
           total_assists
         FROM champion_stats 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_count DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get skill by champion error:', error);
      throw error;
    }
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(userId: string, playerAccountId: string, days: number = 30) {
    try {
      const result = await db.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(*) as matches,
           AVG(CAST(analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate,
           AVG(flow_state_score) as avg_flow_state
         FROM matches 
         WHERE user_id = $1 AND player_account_id = $2 
         AND match_timestamp > NOW() - INTERVAL '1 day' * $3
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [userId, playerAccountId, days]
      );

      return result.rows;
    } catch (error) {
      console.error('Get performance trends error:', error);
      throw error;
    }
  }

  /**
   * Get strengths and weaknesses
   */
  async getStrengthsAndWeaknesses(userId: string, playerAccountId: string): Promise<{
    strengths: string[];
    weaknesses: string[];
  }> {
    try {
      const profile = await this.getSkillProfile(userId, playerAccountId);

      if (!profile) {
        return { strengths: [], weaknesses: [] };
      }

      const scores = [
        { name: 'Mechanics', score: profile.mechanicsScore },
        { name: 'Macro Play', score: profile.macroPlayScore },
        { name: 'Decision Making', score: profile.decisionMakingScore },
        { name: 'Consistency', score: profile.consistencyScore },
        { name: 'Clutch Factor', score: profile.clutchFactorScore },
      ];

      // Sort by score
      scores.sort((a, b) => b.score - a.score);

      const strengths = scores
        .slice(0, 2)
        .filter((s) => s.score >= 60)
        .map((s) => s.name);

      const weaknesses = scores
        .slice(-2)
        .filter((s) => s.score < 60)
        .map((s) => s.name);

      return { strengths, weaknesses };
    } catch (error) {
      console.error('Get strengths and weaknesses error:', error);
      return { strengths: [], weaknesses: [] };
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string, playerAccountId: string): Promise<string[]> {
    try {
      const { strengths, weaknesses } = await this.getStrengthsAndWeaknesses(userId, playerAccountId);
      const profile = await this.getSkillProfile(userId, playerAccountId);

      if (!profile) {
        return [];
      }

      const recommendations: string[] = [];

      // Mechanics recommendations
      if (profile.mechanicsScore < 60) {
        recommendations.push('Focus on improving your champion mechanics through practice');
      }

      // Macro recommendations
      if (profile.macroPlayScore < 60) {
        recommendations.push('Work on map awareness and roaming to other lanes');
      }

      // Decision making recommendations
      if (profile.decisionMakingScore < 60) {
        recommendations.push('Review your decision-making in crucial moments');
      }

      // Consistency recommendations
      if (profile.consistencyScore < 60) {
        recommendations.push('Aim to reduce deaths and play safer');
      }

      // Clutch recommendations
      if (profile.clutchFactorScore < 60) {
        recommendations.push('Practice staying calm in high-pressure situations');
      }

      // Positive recommendations
      if (strengths.length > 0) {
        recommendations.push(`Your ${strengths[0]} is your biggest strength - keep it up!`);
      }

      return recommendations;
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  }

  /**
   * Compare skill profile with average
   */
  async compareWithAverage(userId: string, playerAccountId: string) {
    try {
      const profile = await this.getSkillProfile(userId, playerAccountId);

      if (!profile) {
        return null;
      }

      // Average scores (these would be calculated from all users in production)
      const averageScores = {
        mechanicsScore: 50,
        macroPlayScore: 50,
        decisionMakingScore: 50,
        consistencyScore: 50,
        clutchFactorScore: 50,
      };

      return {
        mechanics: {
          player: profile.mechanicsScore,
          average: averageScores.mechanicsScore,
          difference: profile.mechanicsScore - averageScores.mechanicsScore,
        },
        macroPlay: {
          player: profile.macroPlayScore,
          average: averageScores.macroPlayScore,
          difference: profile.macroPlayScore - averageScores.macroPlayScore,
        },
        decisionMaking: {
          player: profile.decisionMakingScore,
          average: averageScores.decisionMakingScore,
          difference: profile.decisionMakingScore - averageScores.decisionMakingScore,
        },
        consistency: {
          player: profile.consistencyScore,
          average: averageScores.consistencyScore,
          difference: profile.consistencyScore - averageScores.consistencyScore,
        },
        clutchFactor: {
          player: profile.clutchFactorScore,
          average: averageScores.clutchFactorScore,
          difference: profile.clutchFactorScore - averageScores.clutchFactorScore,
        },
      };
    } catch (error) {
      console.error('Compare with average error:', error);
      throw error;
    }
  }
}

export default new SkillProfileService();
