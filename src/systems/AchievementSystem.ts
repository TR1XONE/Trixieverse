/**
 * Achievement System - Track & unlock achievements
 * Players earn achievements for milestones, improvements, and gameplay moments
 */

export type AchievementCategory = 'climbing' | 'skill' | 'streak' | 'consistency' | 'coaching';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100, percentage towards unlock
  requirement: string;
}

export interface AchievementState {
  unlockedAchievements: Achievement[];
  totalAchievementsPoints: number;
  streakCount: number;
  bestStreak: number;
  lastStreakDate: Date;
}

export const ACHIEVEMENTS_DATABASE: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>> = {
  // Climbing Achievements
  bronze_climber: {
    id: 'bronze_climber',
    name: 'Bronze Climber',
    description: 'Reach Bronze rank',
    category: 'climbing',
    icon: '🥉',
    rarity: 'common',
    requirement: 'Reach Bronze rank',
  },
  silver_climber: {
    id: 'silver_climber',
    name: 'Silver Climber',
    description: 'Reach Silver rank',
    category: 'climbing',
    icon: '⚪',
    rarity: 'uncommon',
    requirement: 'Reach Silver rank',
  },
  gold_climber: {
    id: 'gold_climber',
    name: 'Gold Climber',
    description: 'Reach Gold rank',
    category: 'climbing',
    icon: '🟡',
    rarity: 'rare',
    requirement: 'Reach Gold rank',
  },
  platinum_climber: {
    id: 'platinum_climber',
    name: 'Platinum Climber',
    description: 'Reach Platinum rank',
    category: 'climbing',
    icon: '💎',
    rarity: 'epic',
    requirement: 'Reach Platinum rank',
  },
  legendary_climber: {
    id: 'legendary_climber',
    name: 'Legendary Climber',
    description: 'Reach Legendary rank',
    category: 'climbing',
    icon: '⚔️',
    rarity: 'legendary',
    requirement: 'Reach Legendary rank',
  },

  // Skill Achievements
  cs_master: {
    id: 'cs_master',
    name: 'CS Master',
    description: 'Maintain 6+ CS/min for 10 games',
    category: 'skill',
    icon: '📊',
    rarity: 'uncommon',
    requirement: '6+ CS/min average over 10 games',
  },
  mechanics_guru: {
    id: 'mechanics_guru',
    name: 'Mechanics Guru',
    description: 'Reach 80+ Mechanics skill',
    category: 'skill',
    icon: '⚙️',
    rarity: 'rare',
    requirement: '80+ Mechanics rating',
  },
  macro_mastermind: {
    id: 'macro_mastermind',
    name: 'Macro Mastermind',
    description: 'Reach 80+ Macro Play skill',
    category: 'skill',
    icon: '🗺️',
    rarity: 'rare',
    requirement: '80+ Macro Play rating',
  },

  // Streak Achievements
  win_streak_5: {
    id: 'win_streak_5',
    name: 'Hot Hand',
    description: 'Win 5 games in a row',
    category: 'streak',
    icon: '🔥',
    rarity: 'uncommon',
    requirement: '5 consecutive wins',
  },
  win_streak_10: {
    id: 'win_streak_10',
    name: 'On Fire!',
    description: 'Win 10 games in a row',
    category: 'streak',
    icon: '🌊',
    rarity: 'rare',
    requirement: '10 consecutive wins',
  },
  decision_streak: {
    id: 'decision_streak',
    name: 'Perfect Decisions',
    description: 'Make 20 consecutive good decisions',
    category: 'streak',
    icon: '✨',
    rarity: 'epic',
    requirement: '20 good decisions in a row',
  },

  // Consistency Achievements
  consistent_player: {
    id: 'consistent_player',
    name: 'Consistent Player',
    description: 'Play 30 games with consistent performance',
    category: 'consistency',
    icon: '📈',
    rarity: 'uncommon',
    requirement: '30 games with stable trend',
  },
  improvement_machine: {
    id: 'improvement_machine',
    name: 'Improvement Machine',
    description: 'Improve skill rating by 20+ points',
    category: 'consistency',
    icon: '🚀',
    rarity: 'rare',
    requirement: 'Overall rating +20 points',
  },

  // Coaching Achievements
  memory_moments_10: {
    id: 'memory_moments_10',
    name: 'Memorable Player',
    description: 'Create 10 memory moments',
    category: 'coaching',
    icon: '💫',
    rarity: 'uncommon',
    requirement: '10 memorable moments recorded',
  },
  friend_stage: {
    id: 'friend_stage',
    name: 'True Friend',
    description: 'Reach Friend stage with coach',
    category: 'coaching',
    icon: '👥',
    rarity: 'uncommon',
    requirement: 'Coach relationship: Friend stage (25 interactions)',
  },
  legend_stage: {
    id: 'legend_stage',
    name: 'Unbreakable Bond',
    description: 'Reach Legend stage with coach',
    category: 'coaching',
    icon: '💜',
    rarity: 'legendary',
    requirement: 'Coach relationship: Legend stage (100+ interactions)',
  },
};

export class AchievementSystem {
  private userId: string;
  private state: AchievementState;
  private achievements: Map<string, Achievement>;

  constructor(userId: string) {
    this.userId = userId;
    this.state = {
      unlockedAchievements: [],
      totalAchievementsPoints: 0,
      streakCount: 0,
      bestStreak: 0,
      lastStreakDate: new Date(),
    };
    this.achievements = new Map();
    this.initializeAchievements();
    this.loadFromLocalStorage();
  }

  private initializeAchievements() {
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS_DATABASE)) {
      this.achievements.set(achievement.id, {
        ...achievement,
        unlocked: false,
        progress: 0,
      });
    }
  }

  /**
   * Record a win and increment streak
   */
  recordWin() {
    this.state.streakCount++;
    if (this.state.streakCount > this.state.bestStreak) {
      this.state.bestStreak = this.state.streakCount;
    }
    this.state.lastStreakDate = new Date();

    // Check for streak achievements
    if (this.state.streakCount === 5) {
      this.unlockAchievement('win_streak_5');
    }
    if (this.state.streakCount === 10) {
      this.unlockAchievement('win_streak_10');
    }

    this.saveToLocalStorage();
  }

  /**
   * Record a loss and reset streak
   */
  recordLoss() {
    this.state.streakCount = 0;
    this.state.lastStreakDate = new Date();
    this.saveToLocalStorage();
  }

  /**
   * Record good decision in sequence
   */
  recordGoodDecision() {
    // This would need integration with CoachOS
    // For now, it's a placeholder
  }

  /**
   * Update skill progress and check for achievements
   */
  updateSkillProgress(skills: {
    mechanics: number;
    macro: number;
    decisionMaking: number;
    consistency: number;
    clutch: number;
  }) {
    const overallRating =
      (skills.mechanics +
        skills.macro +
        skills.decisionMaking +
        skills.consistency +
        skills.clutch) /
      5;

    // Check skill achievements
    if (skills.mechanics >= 80) {
      this.unlockAchievement('mechanics_guru');
    }
    if (skills.macro >= 80) {
      this.unlockAchievement('macro_mastermind');
    }

    this.saveToLocalStorage();
  }

  /**
   * Update rank and check climbing achievements
   */
  updateRank(rank: 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary') {
    const rankAchievements: Record<string, string> = {
      bronze: 'bronze_climber',
      silver: 'silver_climber',
      gold: 'gold_climber',
      platinum: 'platinum_climber',
      legendary: 'legendary_climber',
    };

    if (rankAchievements[rank]) {
      this.unlockAchievement(rankAchievements[rank]);
    }

    this.saveToLocalStorage();
  }

  /**
   * Unlock an achievement
   */
  private unlockAchievement(achievementId: string) {
    const achievement = this.achievements.get(achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      achievement.progress = 100;

      this.state.unlockedAchievements.push(achievement);
      this.state.totalAchievementsPoints +=
        this.getAchievementPoints(achievement.rarity);

      this.saveToLocalStorage();

      // Dispatch event for UI update
      window.dispatchEvent(
        new CustomEvent('achievementUnlocked', {
          detail: achievement,
        })
      );
    }
  }

  /**
   * Get points for rarity
   */
  private getAchievementPoints(rarity: string): number {
    const pointMap: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 250,
    };
    return pointMap[rarity] || 0;
  }

  /**
   * Get all achievements with progress
   */
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.state.unlockedAchievements;
  }

  /**
   * Get current streak
   */
  getStreak(): { current: number; best: number } {
    return {
      current: this.state.streakCount,
      best: this.state.bestStreak,
    };
  }

  /**
   * Get total achievement points earned
   */
  getTotalAchievementPoints(): number {
    return this.state.totalAchievementsPoints;
  }

  /**
   * Get state
   */
  getState(): AchievementState {
    return this.state;
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage() {
    const data = {
      state: this.state,
      achievements: Array.from(this.achievements.values()),
    };
    localStorage.setItem(`achievements_${this.userId}`, JSON.stringify(data));
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage() {
    const data = localStorage.getItem(`achievements_${this.userId}`);
    if (data) {
      const parsed = JSON.parse(data);
      this.state = parsed.state;
      parsed.achievements.forEach((ach: Achievement) => {
        this.achievements.set(ach.id, ach);
      });
    }
  }

  /**
   * Reset achievements (for testing)
   */
  reset() {
    this.state = {
      unlockedAchievements: [],
      totalAchievementsPoints: 0,
      streakCount: 0,
      bestStreak: 0,
      lastStreakDate: new Date(),
    };
    this.initializeAchievements();
    this.saveToLocalStorage();
  }
}
