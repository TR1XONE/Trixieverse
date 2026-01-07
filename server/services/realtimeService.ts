/**
 * Real-time Service
 * Handles WebSocket connections for live coaching and notifications
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import coachLearningService from './coachLearningService.js';
import matchAnalysisService from './matchAnalysisService.js';

interface UserConnection {
  userId: string;
  socket: Socket;
  playerAccountId?: string;
  inMatch?: boolean;
}

class RealtimeService {
  private io: SocketIOServer | null = null;
  private userConnections: Map<string, UserConnection> = new Map();
  private matchSessions: Map<string, any> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();

    console.log('✅ Real-time service initialized');
    return this.io;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`📱 User connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (userId: string) => {
        this.userConnections.set(userId, {
          userId,
          socket,
        });

        console.log(`✅ User authenticated: ${userId}`);
        socket.emit('authenticated', { success: true });
      });

      // Start match tracking
      socket.on('match:start', (data: { userId: string; playerAccountId: string }) => {
        const connection = this.userConnections.get(data.userId);
        if (connection) {
          connection.inMatch = true;
          connection.playerAccountId = data.playerAccountId;

          this.matchSessions.set(data.userId, {
            startTime: Date.now(),
            playerAccountId: data.playerAccountId,
            events: [],
          });

          // Send coach greeting
          this.sendCoachMessage(data.userId, {
            type: 'match_start',
            message: 'Good luck out there! Let\'s get this win! 💪',
          });
        }
      });

      // Track in-game events
      socket.on('match:event', (data: any) => {
        const session = this.matchSessions.get(data.userId);
        if (session) {
          session.events.push({
            type: data.eventType,
            timestamp: Date.now(),
            data: data.eventData,
          });

          // Send real-time coach reactions
          this.handleMatchEvent(data.userId, data);
        }
      });

      // End match
      socket.on('match:end', async (data: any) => {
        const connection = this.userConnections.get(data.userId);
        if (connection) {
          connection.inMatch = false;

          const session = this.matchSessions.get(data.userId);
          if (session) {
            // Analyze match
            const analysis = await this.analyzeMatchSession(data.userId, session, data.matchData);

            // Send coach reaction
            this.sendCoachMessage(data.userId, {
              type: 'match_end',
              message: analysis.coachReaction,
              analysis,
            });

            this.matchSessions.delete(data.userId);
          }
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        // Find and remove user connection
        for (const [userId, connection] of this.userConnections.entries()) {
          if (connection.socket.id === socket.id) {
            this.userConnections.delete(userId);
            console.log(`📱 User disconnected: ${userId}`);
            break;
          }
        }
      });
    });
  }

  /**
   * Handle in-game events
   */
  private async handleMatchEvent(userId: string, data: any): Promise<void> {
    const eventReactions: Record<string, string> = {
      kill: 'NICE KILL! 🔥',
      death: 'Stay focused, we\'ll bounce back!',
      assist: 'Great teamwork!',
      objective: 'Excellent objective focus!',
      gank: 'Watch out for ganks!',
      teamfight: 'Let\'s go! Team fight!',
    };

    const reaction = eventReactions[data.eventType] || 'Keep it up!';

    this.sendCoachMessage(userId, {
      type: 'match_event',
      eventType: data.eventType,
      message: reaction,
    });
  }

  /**
   * Analyze match session
   */
  private async analyzeMatchSession(userId: string, session: any, matchData: any): Promise<any> {
    try {
      // Calculate performance based on events
      let performanceScore = 50;
      let coachReaction = 'Great effort!';

      const kills = session.events.filter((e: any) => e.type === 'kill').length;
      const deaths = session.events.filter((e: any) => e.type === 'death').length;
      const objectives = session.events.filter((e: any) => e.type === 'objective').length;

      performanceScore += kills * 5;
      performanceScore -= deaths * 3;
      performanceScore += objectives * 10;

      if (performanceScore >= 80) {
        coachReaction = 'THAT WAS INSANE! You absolutely dominated! 🏆';
      } else if (performanceScore >= 60) {
        coachReaction = 'Great performance! You\'re improving! 💪';
      } else if (performanceScore >= 40) {
        coachReaction = 'Good effort! Let\'s analyze what we can improve.';
      } else {
        coachReaction = 'Don\'t worry, every match teaches us something!';
      }

      return {
        performanceScore: Math.min(Math.max(performanceScore, 0), 100),
        kills,
        deaths,
        objectives,
        coachReaction,
      };
    } catch (error) {
      console.error('Analyze match session error:', error);
      return {
        performanceScore: 50,
        coachReaction: 'Great effort!',
      };
    }
  }

  /**
   * Send coach message to user
   */
  sendCoachMessage(userId: string, message: any): void {
    const connection = this.userConnections.get(userId);
    if (connection) {
      connection.socket.emit('coach:message', message);
    }
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  /**
   * Send notification to user
   */
  sendNotification(userId: string, notification: any): void {
    const connection = this.userConnections.get(userId);
    if (connection) {
      connection.socket.emit('notification', notification);
    }
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userConnections.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }
}

export default new RealtimeService();
