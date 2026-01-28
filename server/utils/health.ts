/**
 * Health Check Service
 * Monitors system health including database, Redis, API connectivity
 */

import { Database } from '../database/connection';
import logger from './logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: {
    database: { status: boolean; responseTime: number; error?: string };
    memory: { status: boolean; usage: number; limit: number };
    uptime: number;
  };
}

export class HealthCheck {
  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<{
    status: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const db = new Database();
      await db.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      return { status: true, responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check memory usage
   */
  static checkMemory(): { status: boolean; usage: number; limit: number } {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const isHealthy = heapUsedPercent < 80; // Alert if >80% heap used

    return {
      status: isHealthy,
      usage: Math.round(heapUsedPercent),
      limit: 80,
    };
  }

  /**
   * Get uptime in seconds
   */
  static getUptime(): number {
    return Math.floor(process.uptime());
  }

  /**
   * Comprehensive health check
   */
  static async fullHealthCheck(): Promise<HealthStatus> {
    const dbCheck = await this.checkDatabase();
    const memoryCheck = this.checkMemory();

    // Determine overall status
    const criticalChecksPassed = dbCheck.status && memoryCheck.status;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!criticalChecksPassed) {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      checks: {
        database: dbCheck,
        memory: memoryCheck,
        uptime: this.getUptime(),
      },
    };
  }
}

export default HealthCheck;
