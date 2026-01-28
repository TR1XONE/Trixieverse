/**
 * TrixieVerse Mobile API Service
 * Handles all API communication with backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.trixieverse.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface PlayerData {
  id: string;
  username: string;
  rank: string;
  mainRole: string;
  winRate: number;
  level: number;
  rating: number;
}

interface MatchData {
  id: string;
  champion: string;
  role: string;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  duration: number;
  timestamp: string;
}

interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  rating: number;
  division: string;
  winRate: number;
  matches: number;
}

interface SocialActivity {
  id: string;
  player: string;
  action: string;
  time: string;
  stats: Record<string, number>;
}

interface Friend {
  id: string;
  name: string;
  status: string;
  online: boolean;
  mainRole: string;
}

class TrixieVerseAPI {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  /**
   * Load stored auth token
   */
  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      this.token = token;
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  /**
   * Save auth token
   */
  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  /**
   * Clear auth token
   */
  async clearToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    useAuth = true
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (useAuth && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          await this.clearToken();
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ============ AUTH ENDPOINTS ============

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      'POST',
      '/auth/login',
      { email, password },
      false
    );

    if (response.token) {
      await this.saveToken(response.token);
    }

    return response;
  }

  /**
   * Register user
   */
  async register(email: string, password: string, username: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      'POST',
      '/auth/register',
      { email, password, username },
      false
    );

    if (response.token) {
      await this.saveToken(response.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.clearToken();
  }

  // ============ USER ENDPOINTS ============

  /**
   * Get current user profile
   */
  async getProfile(): Promise<PlayerData> {
    return this.request<PlayerData>('GET', '/account/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<PlayerData>): Promise<PlayerData> {
    return this.request<PlayerData>('PUT', '/account/profile', data);
  }

  /**
   * Link Wild Rift account
   */
  async linkAccount(gameName: string, tag: string): Promise<PlayerData> {
    return this.request<PlayerData>('POST', '/account/link', { gameName, tag });
  }

  // ============ MATCH ENDPOINTS ============

  /**
   * Get recent matches
   */
  async getMatches(limit = 20, offset = 0): Promise<MatchData[]> {
    return this.request<MatchData[]>(
      'GET',
      `/matches?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get single match details
   */
  async getMatch(matchId: string): Promise<MatchData> {
    return this.request<MatchData>('GET', `/matches/${matchId}`);
  }

  /**
   * Analyze match with AI coach
   */
  async analyzeMatch(matchId: string): Promise<any> {
    return this.request<any>('POST', `/matches/${matchId}/analyze`);
  }

  // ============ COACH ENDPOINTS ============

  /**
   * Get coach response for a query
   */
  async getCoachResponse(query: string): Promise<any> {
    return this.request<any>('POST', '/coach/response', { query });
  }

  /**
   * Get coach memories
   */
  async getCoachMemories(): Promise<any[]> {
    return this.request<any[]>('GET', '/coach/memories');
  }

  /**
   * Get coach personality settings
   */
  async getCoachPersonality(): Promise<any> {
    return this.request<any>('GET', '/coach/personality');
  }

  /**
   * Update coach personality
   */
  async updateCoachPersonality(data: any): Promise<any> {
    return this.request<any>('PUT', '/coach/personality', data);
  }

  // ============ LEADERBOARD ENDPOINTS ============

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(limit = 100, offset = 0): Promise<LeaderboardPlayer[]> {
    return this.request<LeaderboardPlayer[]>(
      'GET',
      `/leaderboard?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Get friends leaderboard
   */
  async getFriendsLeaderboard(limit = 50): Promise<LeaderboardPlayer[]> {
    return this.request<LeaderboardPlayer[]>(
      'GET',
      `/leaderboard/friends?limit=${limit}`
    );
  }

  /**
   * Get regional leaderboard
   */
  async getRegionalLeaderboard(region: string, limit = 100): Promise<LeaderboardPlayer[]> {
    return this.request<LeaderboardPlayer[]>(
      'GET',
      `/leaderboard/region/${region}?limit=${limit}`
    );
  }

  /**
   * Get user ranking
   */
  async getUserRanking(): Promise<any> {
    return this.request<any>('GET', '/leaderboard/me');
  }

  // ============ SOCIAL ENDPOINTS ============

  /**
   * Get activity feed
   */
  async getActivityFeed(limit = 20): Promise<SocialActivity[]> {
    return this.request<SocialActivity[]>(
      'GET',
      `/social/activity?limit=${limit}`
    );
  }

  /**
   * Get friends list
   */
  async getFriends(): Promise<Friend[]> {
    return this.request<Friend[]>('GET', '/social/friends');
  }

  /**
   * Add friend
   */
  async addFriend(userId: string): Promise<Friend> {
    return this.request<Friend>('POST', '/social/friends', { userId });
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string): Promise<void> {
    return this.request<void>('DELETE', `/social/friends/${userId}`);
  }

  // ============ ACHIEVEMENT ENDPOINTS ============

  /**
   * Get achievements
   */
  async getAchievements(): Promise<any[]> {
    return this.request<any[]>('GET', '/achievements');
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress(): Promise<any> {
    return this.request<any>('GET', '/achievements/progress');
  }

  // ============ NOTIFICATION ENDPOINTS ============

  /**
   * Register device for push notifications
   */
  async registerDeviceToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    return this.request<void>('POST', '/notifications/device', {
      token,
      platform,
    });
  }

  /**
   * Get notifications
   */
  async getNotifications(limit = 20): Promise<any[]> {
    return this.request<any[]>(`GET`, `/notifications?limit=${limit}`);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>('PUT', `/notifications/${notificationId}/read`);
  }

  // ============ HEALTH CHECK ============

  /**
   * Check API health
   */
  async health(): Promise<any> {
    return this.request<any>('GET', '/health', undefined, false);
  }
}

// Export singleton instance
export default new TrixieVerseAPI();
