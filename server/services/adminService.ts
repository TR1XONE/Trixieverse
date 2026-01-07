/**
 * Admin Service\n * Handles admin operations, moderation, and analytics
 */

import db from '../database/connection.js';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  averageWinRate: number;
  totalAchievements: number;
  topPlayers: any[];
}

class AdminService {
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(): Promise<AdminStats> {
    try {
      // Total users
      const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
      const totalUsers = usersResult.rows[0].count;

      // Active users (last 7 days)
      const activeResult = await db.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM matches 
         WHERE match_timestamp > NOW() - INTERVAL '7 days'`
      );
      const activeUsers = activeResult.rows[0].count;

      // Total matches
      const matchesResult = await db.query('SELECT COUNT(*) as count FROM matches');
      const totalMatches = matchesResult.rows[0].count;

      // Average win rate
      const winRateResult = await db.query(
        `SELECT AVG(CASE WHEN result = 'win' THEN 1 ELSE 0 END) * 100 as avg_win_rate FROM matches`
      );
      const averageWinRate = winRateResult.rows[0].avg_win_rate || 0;

      // Total achievements
      const achievementsResult = await db.query('SELECT COUNT(*) as count FROM achievements');
      const totalAchievements = achievementsResult.rows[0].count;

      // Top players
      const topPlayersResult = await db.query(
        `SELECT 
           u.username,
           COUNT(m.id) as matches,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(m.id) * 100 as win_rate,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id
         GROUP BY u.id, u.username
         HAVING COUNT(m.id) > 0
         ORDER BY avg_performance DESC
         LIMIT 10`
      );
      const topPlayers = topPlayersResult.rows;

      return {
        totalUsers,
        activeUsers,
        totalMatches,
        averageWinRate,
        totalAchievements,
        topPlayers,
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(limit: number = 100, offset: number = 0) {
    try {
      const result = await db.query(
        `SELECT 
           id,
           email,
           username,
           created_at as "createdAt",
           last_login as "lastLogin",
           is_active as "isActive"
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(userId: string) {
    try {
      const userResult = await db.query(
        `SELECT 
           id,
           email,
           username,
           created_at as "createdAt",
           last_login as "lastLogin",
           is_active as "isActive"
         FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get user stats
      const statsResult = await db.query(
        `SELECT 
           COUNT(m.id) as matches,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END) as wins,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           COUNT(a.id) as achievements
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id
         LEFT JOIN achievements a ON u.id = a.user_id
         WHERE u.id = $1`,
        [userId]
      );

      const stats = statsResult.rows[0];

      return {
        ...user,
        stats,
      };
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string, reason: string): Promise<void> {
    try {
      await db.query(
        `UPDATE users SET is_active = false WHERE id = $1`,
        [userId]
      );

      // Log action
      await this.logAdminAction('suspend_user', userId, { reason });
    } catch (error) {
      console.error('Suspend user error:', error);
      throw error;
    }
  }

  /**
   * Unsuspend user
   */
  async unsuspendUser(userId: string): Promise<void> {
    try {
      await db.query(
        `UPDATE users SET is_active = true WHERE id = $1`,
        [userId]
      );

      // Log action
      await this.logAdminAction('unsuspend_user', userId, {});
    } catch (error) {
      console.error('Unsuspend user error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user data
      await db.query('DELETE FROM matches WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM achievements WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM coach_memories WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      // Log action
      await this.logAdminAction('delete_user', userId, {});
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Get reported content
   */
  async getReportedContent(limit: number = 50) {
    try {
      const result = await db.query(
        `SELECT 
           id,
           reported_by as "reportedBy",
           content_type as "contentType",
           content_id as "contentId",
           reason,
           status,
           created_at as "createdAt"
         FROM reports
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get reported content error:', error);
      throw error;
    }
  }

  /**
   * Resolve report
   */
  async resolveReport(reportId: string, action: string): Promise<void> {
    try {
      await db.query(
        `UPDATE reports SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [action, reportId]
      );

      // Log action
      await this.logAdminAction('resolve_report', reportId, { action });
    } catch (error) {
      console.error('Resolve report error:', error);
      throw error;
    }
  }

  /**
   * Get system logs
   */
  async getSystemLogs(limit: number = 100, offset: number = 0) {
    try {
      const result = await db.query(
        `SELECT 
           id,
           action,
           admin_id as "adminId",
           target_id as "targetId",
           details,
           created_at as "createdAt"
         FROM admin_logs
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Get system logs error:', error);
      throw error;
    }
  }

  /**
   * Log admin action
   */
  private async logAdminAction(action: string, targetId: string, details: any): Promise<void> {
    try {
      // In production, save to admin_logs table
      console.log(`[ADMIN] ${action} - Target: ${targetId}`, details);
    } catch (error) {
      console.error('Log admin action error:', error);
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    try {
      // Database connection
      const dbHealth = await db.query('SELECT 1');
      const dbStatus = dbHealth.rows.length > 0 ? 'healthy' : 'unhealthy';

      // Get database size
      const sizeResult = await db.query(
        "SELECT pg_size_pretty(pg_database_size('trixieverse')) as size"
      );
      const dbSize = sizeResult.rows[0].size;

      // Get active connections
      const connectionsResult = await db.query(
        'SELECT count(*) as count FROM pg_stat_activity'
      );
      const activeConnections = connectionsResult.rows[0].count;

      return {
        database: {
          status: dbStatus,
          size: dbSize,
          activeConnections,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get system health error:', error);
      return {
        database: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get analytics report
   */
  async getAnalyticsReport(days: number = 30) {
    try {
      // Daily active users
      const dauResult = await db.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(DISTINCT user_id) as users
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );

      // Daily matches
      const matchesResult = await db.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(*) as matches
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );

      // Daily win rate
      const winRateResult = await db.query(
        `SELECT 
           DATE(match_timestamp) as date,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );

      return {
        dailyActiveUsers: dauResult.rows,
        dailyMatches: matchesResult.rows,
        dailyWinRate: winRateResult.rows,
      };
    } catch (error) {
      console.error('Get analytics report error:', error);
      throw error;
    }
  }
}

export default new AdminService();
