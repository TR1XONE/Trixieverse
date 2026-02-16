/**
 * Notification Service
 * Handles email notifications and in-app alerts
 */

import nodemailer from 'nodemailer';
import db from '../database/connection';
import dotenv from 'dotenv';

dotenv.config();

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeEmailService();
  }

  /**
   * Initialize email service
   */
  private initializeEmailService(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.warn('⚠️ Email service not configured:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('Email service not available');
        return false;
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@trixieverse.com',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return true;
    } catch (error) {
      console.error('Send email error:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const template: EmailTemplate = {
      subject: '⚔️ Welcome to TrixieVerse!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00d4ff;">Welcome to TrixieVerse, ${username}! 🎮</h1>
          <p>Your personal AI coach is ready to help you reach new heights in Wild Rift.</p>
          
          <h2 style="color: #00d4ff;">Getting Started:</h2>
          <ol>
            <li>Connect your Wild Rift account</li>
            <li>Customize your coach personality</li>
            <li>Play matches and get real-time coaching</li>
            <li>Track your progress with the Skill Radar</li>
          </ol>
          
          <p>Questions? Check out our <a href="https://trixieverse.com/docs">documentation</a> or join our <a href="https://discord.gg/trixieverse">Discord community</a>.</p>
          
          <p style="color: #666; font-size: 12px;">In TrixieVerse, every player becomes a legend. 💜⚔️</p>
        </div>
      `,
      text: `Welcome to TrixieVerse, ${username}!\n\nYour personal AI coach is ready to help you reach new heights in Wild Rift.`,
    };

    await this.sendEmail(email, template);
  }

  /**
   * Send rank up notification
   */
  async sendRankUpEmail(email: string, username: string, newRank: string): Promise<void> {
    const template: EmailTemplate = {
      subject: `🎉 Congratulations! You ranked up to ${newRank}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00ff00;">🎉 Rank Up! 🎉</h1>
          <p>Congratulations ${username}! You've reached <strong>${newRank}</strong>!</p>
          
          <p>Your hard work and dedication are paying off. Keep up the great work!</p>
          
          <p style="color: #666; font-size: 12px;">In TrixieVerse, every player becomes a legend. 💜⚔️</p>
        </div>
      `,
      text: `Congratulations ${username}! You've reached ${newRank}!`,
    };

    await this.sendEmail(email, template);
  }

  /**
   * Send achievement unlock email
   */
  async sendAchievementEmail(
    email: string,
    username: string,
    achievement: string,
    rarity: string
  ): Promise<void> {
    const rarityEmoji = {
      common: '⚪',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡',
    }[rarity] || '⭐';

    const template: EmailTemplate = {
      subject: `${rarityEmoji} Achievement Unlocked: ${achievement}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00d4ff;">${rarityEmoji} Achievement Unlocked!</h1>
          <p>Congratulations ${username}!</p>
          <p>You've unlocked the <strong>${achievement}</strong> achievement!</p>
          
          <p style="color: #666; font-size: 12px;">In TrixieVerse, every player becomes a legend. 💜⚔️</p>
        </div>
      `,
      text: `Achievement Unlocked: ${achievement}!`,
    };

    await this.sendEmail(email, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const template: EmailTemplate = {
      subject: '🔐 Reset Your TrixieVerse Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00d4ff;">Password Reset Request</h1>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #00d4ff; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
        </div>
      `,
      text: `Click here to reset your password: ${resetLink}`,
    };

    await this.sendEmail(email, template);
  }

  /**
   * Send daily summary email
   */
  async sendDailySummaryEmail(
    email: string,
    username: string,
    stats: {
      matchesPlayed: number;
      winRate: number;
      avgPerformance: number;
      achievements: number;
    }
  ): Promise<void> {
    const template: EmailTemplate = {
      subject: `📊 Your Daily TrixieVerse Summary`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00d4ff;">Daily Summary - ${new Date().toLocaleDateString()}</h1>
          
          <h2>Hey ${username}! 👋</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Matches Played:</strong> ${stats.matchesPlayed}</p>
            <p><strong>Win Rate:</strong> ${stats.winRate.toFixed(1)}%</p>
            <p><strong>Avg Performance:</strong> ${stats.avgPerformance.toFixed(0)}/100</p>
            <p><strong>Achievements Unlocked:</strong> ${stats.achievements}</p>
          </div>
          
          <p>Keep up the great work! Your coach believes in you! 💜</p>
          
          <p style="color: #666; font-size: 12px;">In TrixieVerse, every player becomes a legend. 💜⚔️</p>
        </div>
      `,
      text: `Daily Summary\n\nMatches: ${stats.matchesPlayed}\nWin Rate: ${stats.winRate.toFixed(1)}%\nAvg Performance: ${stats.avgPerformance.toFixed(0)}/100`,
    };

    await this.sendEmail(email, template);
  }

  /**
   * Send in-app notification
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // In production, save to database
      console.log(`📬 Notification for ${userId}: ${title}`);
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  /**
   * Send push notification (for mobile)
   */
  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      // In production, integrate with Firebase Cloud Messaging or similar
      console.log(`📱 Push notification for ${userId}: ${title}`);
    } catch (error) {
      console.error('Send push notification error:', error);
    }
  }

  /**
   * Send weekly report email
   */
  async sendWeeklyReportEmail(
    email: string,
    username: string,
    stats: {
      totalMatches: number;
      totalWins: number;
      winRate: number;
      avgPerformance: number;
      topChampion: string;
      achievements: number;
      skillImprovement: number;
    }
  ): Promise<void> {
    const template: EmailTemplate = {
      subject: `📈 Your Weekly TrixieVerse Report`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00d4ff;">Weekly Report</h1>
          
          <h2>Hey ${username}! 👋</h2>
          <p>Here's your progress for this week:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Total Matches:</strong> ${stats.totalMatches}</p>
            <p><strong>Wins:</strong> ${stats.totalWins}</p>
            <p><strong>Win Rate:</strong> ${stats.winRate.toFixed(1)}%</p>
            <p><strong>Avg Performance:</strong> ${stats.avgPerformance.toFixed(0)}/100</p>
            <p><strong>Top Champion:</strong> ${stats.topChampion}</p>
            <p><strong>Skill Improvement:</strong> ${stats.skillImprovement > 0 ? '+' : ''}${stats.skillImprovement.toFixed(1)}%</p>
            <p><strong>Achievements:</strong> ${stats.achievements}</p>
          </div>
          
          <p>You're making great progress! Keep playing and improving! 💪</p>
          
          <p style="color: #666; font-size: 12px;">In TrixieVerse, every player becomes a legend. 💜⚔️</p>
        </div>
      `,
      text: `Weekly Report\n\nMatches: ${stats.totalMatches}\nWin Rate: ${stats.winRate.toFixed(1)}%\nSkill Improvement: ${stats.skillImprovement.toFixed(1)}%`,
    };

    await this.sendEmail(email, template);
  }
}

export default new NotificationService();
