/**
 * Match Analysis & Tracking Service
 * Analyzes matches and extracts insights for coaching
 */

import db from '../database/connection';
import coachLearningService from './coachLearningService.js';

interface MatchAnalysis {
  matchId: string;
  championName: string;
  role: string;
  result: 'win' | 'loss';
  kda: string;
  performanceScore: number;
  flowStateScore: number;
  insights: string[];
  memoryType: 'epic_play' | 'clutch_moment' | 'mistake' | 'learning' | null;
  coachReaction: string;
}

class MatchAnalysisService {
  /**
   * Analyze a match and save insights
   */
  async analyzeMatch(
    userId: string,
    playerAccountId: string,
    matchData: any
  ): Promise<MatchAnalysis> {
    try {
      // Extract player data from match
      const participant = this.findPlayerInMatch(matchData, userId);

      if (!participant) {
        throw new Error('Player not found in match data');
      }

      // Calculate metrics
      const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
      const performanceScore = this.calculatePerformanceScore(participant);
      const flowStateScore = this.calculateFlowState(participant);
      const insights = this.generateInsights(participant);
      const memoryType = this.determineMemoryType(participant, performanceScore);

      // Save match to database
      const matchResult = await db.query(
        `INSERT INTO matches 
         (user_id, player_account_id, riot_match_id, champion_name, role, result, 
          kills, deaths, assists, kda, gold_earned, damage_dealt, damage_taken, 
          cs, duration_seconds, match_timestamp, analyzed, analysis_data, flow_state_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, $17, $18)
         RETURNING *`,
        [
          userId,
          playerAccountId,
          matchData.metadata.matchId,
          participant.championName,
          participant.individualPosition || 'unknown',
          participant.win ? 'win' : 'loss',
          participant.kills,
          participant.deaths,
          participant.assists,
          kda,
          participant.goldEarned,
          participant.totalDamageDealtToChampions,
          participant.totalDamageTaken,
          participant.totalMinionsKilled,
          matchData.info.gameDuration,
          new Date(matchData.info.gameCreation),
          JSON.stringify({
            insights,
            performanceScore,
            flowStateScore,
          }),
          flowStateScore,
        ]
      );

      // Save memorable moment if applicable
      if (memoryType) {
        const coachReaction = await coachLearningService.generateCoachResponse(userId, {
          eventType: memoryType,
          championName: participant.championName,
          kda,
          matchResult: participant.win ? 'win' : 'loss',
        });

        await coachLearningService.saveMemory(userId, playerAccountId, memoryType, {
          championName: participant.championName,
          enemyChampion: this.getEnemyChampions(matchData, participant.teamId)[0],
          description: insights.join(' | '),
          kda,
          importanceScore: performanceScore,
          coachReaction,
          matchTimestamp: new Date(matchData.info.gameCreation),
        });
      }

      // Update skill profile
      await this.updateSkillProfile(userId, playerAccountId, participant, performanceScore);

      // Update champion stats
      await this.updateChampionStats(userId, playerAccountId, participant);

      return {
        matchId: matchData.metadata.matchId,
        championName: participant.championName,
        role: participant.individualPosition || 'unknown',
        result: participant.win ? 'win' : 'loss',
        kda,
        performanceScore,
        flowStateScore,
        insights,
        memoryType,
        coachReaction: memoryType ? await coachLearningService.generateCoachResponse(userId, {
          eventType: memoryType,
          championName: participant.championName,
          kda,
        }) : '',
      };
    } catch (error) {
      console.error('Match analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(participant: any): number {
    let score = 50; // Base score

    // KDA impact
    const kda = (participant.kills + participant.assists) / Math.max(participant.deaths, 1);
    score += Math.min(kda * 5, 20);

    // CS impact
    const csPerMin = participant.totalMinionsKilled / (participant.timePlayed / 60);
    score += Math.min((csPerMin / 5) * 10, 15);

    // Damage impact
    const damagePerMin = participant.totalDamageDealtToChampions / (participant.timePlayed / 60);
    score += Math.min((damagePerMin / 100) * 10, 15);

    // Vision impact
    score += Math.min(participant.visionScore / 5, 10);

    // Objective impact
    score += Math.min((participant.turretKills + participant.inhibitorKills) * 2, 10);

    // Win bonus
    if (participant.win) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate flow state score (0-100)
   * Measures how "in the zone" the player was
   */
  private calculateFlowState(participant: any): number {
    let score = 50;

    // Kill streak impact
    score += Math.min(participant.largestKillingSpree * 2, 20);

    // Multi-kill impact
    const multiKills = (participant.doubleKills * 2 + participant.tripleKills * 5 + participant.quadraKills * 10 + participant.pentaKills * 20);
    score += Math.min(multiKills, 20);

    // Consistency (low death count)
    if (participant.deaths === 0) {
      score += 15;
    } else if (participant.deaths <= 2) {
      score += 10;
    }

    // Time spent living
    score += Math.min((participant.longestTimeSpentLiving / 300) * 10, 10);

    // Objective focus
    const objectives = participant.turretKills + participant.inhibitorKills + participant.baronKills;
    score += Math.min(objectives * 5, 15);

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Generate insights from match
   */
  private generateInsights(participant: any): string[] {
    const insights: string[] = [];

    // KDA insights
    if (participant.kills >= 10) {
      insights.push('Excellent kill participation');
    }
    if (participant.deaths === 0) {
      insights.push('Perfect positioning - no deaths');
    }
    if (participant.assists >= 15) {
      insights.push('Great team support');
    }

    // CS insights
    const csPerMin = participant.totalMinionsKilled / (participant.timePlayed / 60);
    if (csPerMin >= 7) {
      insights.push('Outstanding CS efficiency');
    }

    // Damage insights
    if (participant.totalDamageDealtToChampions > 20000) {
      insights.push('High damage output');
    }

    // Vision insights
    if (participant.visionScore >= 30) {
      insights.push('Excellent map awareness');
    }

    // Objective insights
    if (participant.turretKills + participant.inhibitorKills >= 3) {
      insights.push('Strong objective focus');
    }

    if (insights.length === 0) {
      insights.push('Solid performance overall');
    }

    return insights;
  }

  /**
   * Determine if this match should be saved as a memory
   */
  private determineMemoryType(participant: any, performanceScore: number): 'epic_play' | 'clutch_moment' | 'mistake' | 'learning' | null {
    // Epic play
    if (performanceScore >= 80 && participant.win) {
      return 'epic_play';
    }

    // Clutch moment
    if (participant.pentaKills > 0 || participant.quadraKills > 0) {
      return 'clutch_moment';
    }

    // Mistake
    if (participant.deaths >= 5 && !participant.win) {
      return 'mistake';
    }

    // Learning moment
    if (performanceScore >= 60 && !participant.win) {
      return 'learning';
    }

    return null;
  }

  /**
   * Find player in match data
   */
  private findPlayerInMatch(matchData: any, userId: string): any {
    // This is simplified - in production, you'd match by PUUID
    return matchData.info.participants[0];
  }

  /**
   * Get enemy champions
   */
  private getEnemyChampions(matchData: any, teamId: number): string[] {
    return matchData.info.participants
      .filter((p: any) => p.teamId !== teamId)
      .map((p: any) => p.championName)
      .slice(0, 3);
  }

  /**
   * Update skill profile based on match
   */
  private async updateSkillProfile(
    userId: string,
    playerAccountId: string,
    participant: any,
    performanceScore: number
  ): Promise<void> {
    try {
      // Get or create skill profile
      let profile = await db.query(
        `SELECT * FROM skill_profiles WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );

      // Calculate individual skill scores
      const mechanicsScore = Math.min(50 + (participant.kills * 2), 100);
      const macroScore = Math.min(50 + ((participant.totalMinionsKilled / 100) * 2), 100);
      const decisionScore = Math.min(50 + ((participant.assists / 10) * 2), 100);
      const consistencyScore = Math.min(50 + ((100 - participant.deaths * 10)), 100);
      const clutchScore = Math.min(50 + ((participant.largestKillingSpree * 2)), 100);

      const overallRating = (mechanicsScore + macroScore + decisionScore + consistencyScore + clutchScore) / 5;

      if (profile.rows.length === 0) {
        await db.query(
          `INSERT INTO skill_profiles 
           (user_id, player_account_id, mechanics_score, macro_play_score, decision_making_score, 
            consistency_score, clutch_factor_score, overall_rating, matches_analyzed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
          [userId, playerAccountId, mechanicsScore, macroScore, decisionScore, consistencyScore, clutchScore, overallRating]
        );
      } else {
        // Update with weighted average
        const current = profile.rows[0];
        const weight = 0.7; // New match has 70% weight

        await db.query(
          `UPDATE skill_profiles 
           SET mechanics_score = $1,
               macro_play_score = $2,
               decision_making_score = $3,
               consistency_score = $4,
               clutch_factor_score = $5,
               overall_rating = $6,
               matches_analyzed = matches_analyzed + 1,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $7 AND player_account_id = $8`,
          [
            current.mechanics_score * (1 - weight) + mechanicsScore * weight,
            current.macro_play_score * (1 - weight) + macroScore * weight,
            current.decision_making_score * (1 - weight) + decisionScore * weight,
            current.consistency_score * (1 - weight) + consistencyScore * weight,
            current.clutch_factor_score * (1 - weight) + clutchScore * weight,
            overallRating,
            userId,
            playerAccountId,
          ]
        );
      }
    } catch (error) {
      console.error('Update skill profile error:', error);
    }
  }

  /**
   * Update champion statistics
   */
  private async updateChampionStats(
    userId: string,
    playerAccountId: string,
    participant: any
  ): Promise<void> {
    try {
      const champResult = await db.query(
        `SELECT * FROM champion_stats 
         WHERE user_id = $1 AND player_account_id = $2 AND champion_name = $3`,
        [userId, playerAccountId, participant.championName]
      );

      if (champResult.rows.length === 0) {
        await db.query(
          `INSERT INTO champion_stats 
           (user_id, player_account_id, champion_name, match_count, total_kills, 
            total_deaths, total_assists, average_kda, last_played)
           VALUES ($1, $2, $3, 1, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
          [
            userId,
            playerAccountId,
            participant.championName,
            participant.kills,
            participant.deaths,
            participant.assists,
            ((participant.kills + participant.assists) / Math.max(participant.deaths, 1)).toFixed(2),
          ]
        );
      } else {
        const current = champResult.rows[0];
        const newKda = ((current.total_kills + participant.kills + current.total_assists + participant.assists) / Math.max(current.total_deaths + participant.deaths, 1)).toFixed(2);

        await db.query(
          `UPDATE champion_stats 
           SET match_count = match_count + 1,
               total_kills = total_kills + $1,
               total_deaths = total_deaths + $2,
               total_assists = total_assists + $3,
               average_kda = $4,
               last_played = CURRENT_TIMESTAMP
           WHERE user_id = $5 AND player_account_id = $6 AND champion_name = $7`,
          [
            participant.kills,
            participant.deaths,
            participant.assists,
            newKda,
            userId,
            playerAccountId,
            participant.championName,
          ]
        );
      }
    } catch (error) {
      console.error('Update champion stats error:', error);
    }
  }

  /**
   * Get match history
   */
  async getMatchHistory(userId: string, playerAccountId: string, limit: number = 20) {
    try {
      const result = await db.query(
        `SELECT * FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get match history error:', error);
      throw error;
    }
  }
}

export default new MatchAnalysisService();
