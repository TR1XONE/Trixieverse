/**
 * Social Features Service
 * Handles friends, coaching circles, and social interactions
 */

import db from '../database/connection.js';

interface Friend {
  id: string;
  username: string;
  currentRank: string;
  isOnline: boolean;
}

interface CoachingCircle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
}

class SocialService {
  /**
   * Add friend
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Check if already friends
      const existing = await db.query(
        `SELECT id FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Already friends');
      }

      // Add friendship
      await db.query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'accepted')`,
        [userId, friendId]
      );

      // Also add reverse relationship
      await db.query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'accepted')`,
        [friendId, userId]
      );
    } catch (error) {
      console.error('Add friend error:', error);
      throw error;
    }
  }

  /**
   * Get friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const result = await db.query(
        `SELECT 
           u.id,
           u.username,
           pa.current_rank as "currentRank",
           CASE WHEN s.user_id IS NOT NULL THEN true ELSE false END as "isOnline"
         FROM friendships f
         JOIN users u ON f.friend_id = u.id
         LEFT JOIN player_accounts pa ON u.id = pa.user_id AND pa.is_primary = true
         LEFT JOIN sessions s ON u.id = s.user_id AND s.expires_at > NOW()
         WHERE f.user_id = $1 AND f.status = 'accepted'
         ORDER BY u.username`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get friends error:', error);
      throw error;
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      await db.query(
        `DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId]
      );
    } catch (error) {
      console.error('Remove friend error:', error);
      throw error;
    }
  }

  /**
   * Create coaching circle
   */
  async createCoachingCircle(
    userId: string,
    data: {
      name: string;
      description: string;
      isPublic: boolean;
    }
  ): Promise<CoachingCircle> {
    try {
      const result = await db.query(
        `INSERT INTO coaching_circles (creator_id, name, description, is_public)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, data.name, data.description, data.isPublic]
      );

      // Add creator as member
      const circleId = result.rows[0].id;
      await db.query(
        `INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, 'admin')`,
        [circleId, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create coaching circle error:', error);
      throw error;
    }
  }

  /**
   * Join coaching circle
   */
  async joinCoachingCircle(userId: string, circleId: string): Promise<void> {
    try {
      // Check if already member
      const existing = await db.query(
        `SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2`,
        [circleId, userId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Already a member');
      }

      // Add member
      await db.query(
        `INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, 'member')`,
        [circleId, userId]
      );
    } catch (error) {
      console.error('Join coaching circle error:', error);
      throw error;
    }
  }

  /**
   * Get coaching circles
   */
  async getCoachingCircles(userId: string): Promise<CoachingCircle[]> {
    try {
      const result = await db.query(
        `SELECT 
           cc.id,
           cc.name,
           cc.description,
           COUNT(cm.id) as "memberCount",
           u.username as "createdBy",
           cc.created_at as "createdAt"
         FROM coaching_circles cc
         JOIN circle_members cm ON cc.id = cm.circle_id
         JOIN users u ON cc.creator_id = u.id
         WHERE cm.user_id = $1
         GROUP BY cc.id, u.username
         ORDER BY cc.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get coaching circles error:', error);
      throw error;
    }
  }

  /**
   * Get circle members
   */
  async getCircleMembers(circleId: string) {
    try {
      const result = await db.query(
        `SELECT 
           u.id,
           u.username,
           cm.role,
           pa.current_rank as "currentRank"
         FROM circle_members cm
         JOIN users u ON cm.user_id = u.id
         LEFT JOIN player_accounts pa ON u.id = pa.user_id AND pa.is_primary = true
         WHERE cm.circle_id = $1
         ORDER BY cm.role DESC, u.username`,
        [circleId]
      );

      return result.rows;
    } catch (error) {
      console.error('Get circle members error:', error);
      throw error;
    }
  }

  /**
   * Post in circle
   */
  async postInCircle(userId: string, circleId: string, content: string): Promise<any> {
    try {
      const result = await db.query(
        `INSERT INTO circle_posts (circle_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [circleId, userId, content]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Post in circle error:', error);
      throw error;
    }
  }

  /**
   * Get circle feed
   */
  async getCircleFeed(circleId: string, limit: number = 50) {
    try {
      const result = await db.query(
        `SELECT 
           cp.id,
           cp.content,
           u.username,
           cp.created_at as "createdAt",
           COUNT(DISTINCT cpl.id) as "likeCount",
           COUNT(DISTINCT cpc.id) as "commentCount"
         FROM circle_posts cp
         JOIN users u ON cp.user_id = u.id
         LEFT JOIN circle_post_likes cpl ON cp.id = cpl.post_id
         LEFT JOIN circle_post_comments cpc ON cp.id = cpc.post_id
         WHERE cp.circle_id = $1
         GROUP BY cp.id, u.username
         ORDER BY cp.created_at DESC
         LIMIT $2`,
        [circleId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get circle feed error:', error);
      throw error;
    }
  }

  /**
   * Create tournament
   */
  async createTournament(
    userId: string,
    data: {
      name: string;
      description: string;
      maxPlayers: number;
      startDate: Date;
      endDate: Date;
    }
  ): Promise<any> {
    try {
      const result = await db.query(
        `INSERT INTO tournaments (creator_id, name, description, max_players, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'upcoming')
         RETURNING *`,
        [userId, data.name, data.description, data.maxPlayers, data.startDate, data.endDate]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Create tournament error:', error);
      throw error;
    }
  }

  /**
   * Join tournament
   */
  async joinTournament(userId: string, tournamentId: string): Promise<void> {
    try {
      // Check if already joined
      const existing = await db.query(
        `SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2`,
        [tournamentId, userId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Already joined');
      }

      // Add participant
      await db.query(
        `INSERT INTO tournament_participants (tournament_id, user_id, status)
         VALUES ($1, $2, 'active')`,
        [tournamentId, userId]
      );
    } catch (error) {
      console.error('Join tournament error:', error);
      throw error;
    }
  }

  /**
   * Get tournaments
   */
  async getTournaments(status: string = 'upcoming'): Promise<any[]> {
    try {
      const result = await db.query(
        `SELECT 
           t.id,
           t.name,
           t.description,
           t.max_players as "maxPlayers",
           COUNT(tp.id) as "participantCount",
           t.start_date as "startDate",
           t.end_date as "endDate",
           t.status,
           u.username as "createdBy"
         FROM tournaments t
         LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
         JOIN users u ON t.creator_id = u.id
         WHERE t.status = $1
         GROUP BY t.id, u.username
         ORDER BY t.start_date ASC`,
        [status]
      );

      return result.rows;
    } catch (error) {
      console.error('Get tournaments error:', error);
      throw error;
    }
  }

  /**
   * Share achievement
   */
  async shareAchievement(userId: string, achievementId: string): Promise<any> {
    try {
      const result = await db.query(
        `INSERT INTO achievement_shares (user_id, achievement_id, shared_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, achievementId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Share achievement error:', error);
      throw error;
    }
  }

  /**
   * Get shared achievements feed
   */
  async getSharedAchievementsFeed(limit: number = 50): Promise<any[]> {
    try {
      const result = await db.query(
        `SELECT 
           u.username,
           a.title as "achievementTitle",
           a.rarity,
           ash.shared_at as "sharedAt"
         FROM achievement_shares ash
         JOIN users u ON ash.user_id = u.id
         JOIN achievements a ON ash.achievement_id = a.id
         ORDER BY ash.shared_at DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get shared achievements feed error:', error);
      throw error;
    }
  }
}

export default new SocialService();
