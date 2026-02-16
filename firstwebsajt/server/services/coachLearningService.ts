/**
 * Coach Learning System Service
 * Handles coach memory, personality evolution, and relationship tracking
 */

import db from '../database/connection';

interface CoachMemory {
  id: string;
  memoryType: string;
  championName: string;
  enemyChampion: string;
  description: string;
  kda: string;
  importanceScore: number;
  coachReaction: string;
  matchTimestamp: Date;
}

interface CoachRelationship {
  relationshipStage: string;
  relationshipScore: number;
  totalInteractions: number;
  trustLevel: number;
  personalJokes: number;
  insideJokes: string[];
}

class CoachLearningService {
  /**
   * Save a memorable moment
   */
  async saveMemory(
    userId: string,
    playerAccountId: string,
    memoryType: string,
    data: {
      championName: string;
      enemyChampion?: string;
      description: string;
      kda: string;
      importanceScore: number;
      coachReaction: string;
      matchTimestamp: Date;
    }
  ): Promise<CoachMemory> {
    try {
      const result = await db.query(
        `INSERT INTO coach_memories 
         (user_id, player_account_id, memory_type, champion_name, enemy_champion, 
          description, kda, importance_score, coach_reaction, match_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          playerAccountId,
          memoryType,
          data.championName,
          data.enemyChampion || null,
          data.description,
          data.kda,
          data.importanceScore,
          data.coachReaction,
          data.matchTimestamp,
        ]
      );

      // Update relationship score based on memory importance
      await this.updateRelationshipScore(userId, data.importanceScore / 10);

      return result.rows[0];
    } catch (error) {
      console.error('Save memory error:', error);
      throw error;
    }
  }

  /**
   * Get coach memories for a player
   */
  async getMemories(
    userId: string,
    playerAccountId: string,
    limit: number = 10
  ): Promise<CoachMemory[]> {
    try {
      const result = await db.query(
        `SELECT * FROM coach_memories 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY importance_score DESC, created_at DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get memories error:', error);
      throw error;
    }
  }

  /**
   * Get memorable moments by type
   */
  async getMemoriesByType(
    userId: string,
    playerAccountId: string,
    memoryType: string,
    limit: number = 5
  ): Promise<CoachMemory[]> {
    try {
      const result = await db.query(
        `SELECT * FROM coach_memories 
         WHERE user_id = $1 AND player_account_id = $2 AND memory_type = $3
         ORDER BY importance_score DESC
         LIMIT $4`,
        [userId, playerAccountId, memoryType, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get memories by type error:', error);
      throw error;
    }
  }

  /**
   * Update coach relationship
   */
  async updateRelationshipScore(userId: string, scoreIncrease: number): Promise<CoachRelationship> {
    try {
      // Get current relationship
      let relationship = await db.query(
        `SELECT * FROM coach_relationships WHERE user_id = $1`,
        [userId]
      );

      if (relationship.rows.length === 0) {
        // Create new relationship
        const result = await db.query(
          `INSERT INTO coach_relationships (user_id, relationship_score, total_interactions, trust_level)
           VALUES ($1, $2, 1, $3)
           RETURNING *`,
          [userId, scoreIncrease, Math.min(scoreIncrease, 10)]
        );

        return result.rows[0];
      }

      const current = relationship.rows[0];
      const newScore = Math.min(current.relationship_score + scoreIncrease, 100);
      const newStage = this.calculateRelationshipStage(newScore);
      const newTrustLevel = Math.min(current.trust_level + scoreIncrease / 5, 100);

      const result = await db.query(
        `UPDATE coach_relationships 
         SET relationship_score = $1, 
             relationship_stage = $2,
             trust_level = $3,
             total_interactions = total_interactions + 1,
             last_interaction = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [newScore, newStage, newTrustLevel, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update relationship error:', error);
      throw error;
    }
  }

  /**
   * Calculate relationship stage based on score
   */
  private calculateRelationshipStage(score: number): string {
    if (score < 15) return 'stranger';
    if (score < 30) return 'acquaintance';
    if (score < 60) return 'friend';
    if (score < 85) return 'best_friend';
    return 'legend';
  }

  /**
   * Get coach relationship
   */
  async getRelationship(userId: string): Promise<CoachRelationship | null> {
    try {
      const result = await db.query(
        `SELECT * FROM coach_relationships WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get relationship error:', error);
      throw error;
    }
  }

  /**
   * Add inside joke to coach personality
   */
  async addInsideJoke(userId: string, joke: string): Promise<void> {
    try {
      const relationship = await this.getRelationship(userId);

      if (!relationship) {
        return;
      }

      const currentJokes = relationship.inside_jokes || [];
      const updatedJokes = [...currentJokes, joke];

      await db.query(
        `UPDATE coach_relationships 
         SET inside_jokes = $1, personal_jokes = personal_jokes + 1
         WHERE user_id = $2`,
        [updatedJokes, userId]
      );
    } catch (error) {
      console.error('Add inside joke error:', error);
      throw error;
    }
  }

  /**
   * Get coach personality for user
   */
  async getCoachPersonality(userId: string) {
    try {
      const result = await db.query(
        `SELECT * FROM coach_personalities WHERE user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Get coach personality error:', error);
      throw error;
    }
  }

  /**
   * Update coach personality
   */
  async updateCoachPersonality(
    userId: string,
    personality: {
      personalityType: string;
      accent: string;
      responseStyle: string;
      messageLength?: string;
      celebrationLevel?: number;
    }
  ) {
    try {
      const result = await db.query(
        `INSERT INTO coach_personalities 
         (user_id, personality_type, accent, response_style, message_length, celebration_level)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
         personality_type = $2,
         accent = $3,
         response_style = $4,
         message_length = $5,
         celebration_level = $6,
         updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userId,
          personality.personalityType,
          personality.accent,
          personality.responseStyle,
          personality.messageLength || 'medium',
          personality.celebrationLevel || 5,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update coach personality error:', error);
      throw error;
    }
  }

  /**
   * Generate coach response based on context
   */
  async generateCoachResponse(
    userId: string,
    context: {
      eventType: string;
      championName?: string;
      kda?: string;
      matchResult?: string;
      memoryContext?: string;
    }
  ): Promise<string> {
    try {
      const personality = await this.getCoachPersonality(userId);
      const relationship = await this.getRelationship(userId);

      if (!personality) {
        return 'Great job out there!';
      }

      // Generate response based on personality and context
      const responses: Record<string, string[]> = {
        win: [
          'YOOO THAT WAS INSANE! 🔥',
          'You absolutely dominated that match!',
          'That was a masterclass performance!',
          'Your mechanics were on point!',
        ],
        loss: [
          'You gave it your all, that\'s what matters!',
          'This is a learning opportunity - let\'s analyze what happened.',
          'Don\'t worry, we\'ll bounce back stronger!',
          'Every loss teaches us something new.',
        ],
        epic_play: [
          'THAT WAS LEGENDARY! 🏆',
          'I\'ve never seen a play like that before!',
          'Your decision-making was perfect!',
          'That play is going to be in the highlight reel!',
        ],
        milestone: [
          'CONGRATULATIONS! You reached a new milestone! 🎉',
          'Your hard work is paying off!',
          'This is just the beginning!',
          'You\'re on fire right now!',
        ],
      };

      const eventResponses = responses[context.eventType] || responses.win;
      const randomResponse = eventResponses[Math.floor(Math.random() * eventResponses.length)];

      // Add personal touch based on relationship
      if (relationship && relationship.relationship_stage === 'best_friend') {
        return `${randomResponse} You know I believe in you! 💜`;
      }

      return randomResponse;
    } catch (error) {
      console.error('Generate coach response error:', error);
      return 'Great job!';
    }
  }
}

export default new CoachLearningService();
