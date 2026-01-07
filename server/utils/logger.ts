/**
 * Logger Utility
 * Centralized logging for the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

class Logger {
  private logDir: string;
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get log file path
   */
  private getLogFile(level: string): string {
    return path.join(this.logDir, `${level}.log`);
  }

  /**
   * Write log entry
   */
  private writeLog(level: string, data: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      ...data,
    };

    const logFile = this.getLogFile(level);
    const logEntry = JSON.stringify(entry) + '\n';

    try {
      // Check file size and rotate if necessary
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxLogSize) {
          const backupFile = `${logFile}.${Date.now()}`;
          fs.renameSync(logFile, backupFile);
        }
      }

      fs.appendFileSync(logFile, logEntry);

      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${level.toUpperCase()}]`, data);
      }
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Log info
   */
  info(message: string, data?: any): void {
    this.writeLog('info', { message, ...data });
  }

  /**
   * Log warning
   */
  warn(message: string, data?: any): void {
    this.writeLog('warn', { message, ...data });
  }

  /**
   * Log error
   */
  error(data: any): void {
    this.writeLog('error', data);
  }

  /**
   * Log debug
   */
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', { message, ...data });
    }
  }

  /**
   * Log performance
   */
  performance(endpoint: string, duration: number, statusCode: number): void {
    this.writeLog('performance', {
      message: `${endpoint} - ${duration}ms - ${statusCode}`,
      endpoint,
      duration,
      statusCode,
    });
  }

  /**
   * Get logs
   */
  getLogs(level: string, limit: number = 100): LogEntry[] {
    try {
      const logFile = this.getLogFile(level);

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      return lines
        .slice(-limit)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((entry) => entry !== null) as LogEntry[];
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  /**
   * Clear old logs
   */
  clearOldLogs(daysOld: number = 7): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }
}

export default new Logger();
