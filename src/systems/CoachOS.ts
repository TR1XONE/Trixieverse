/**
 * CoachOS - The Living Coach Operating System
 * 
 * A revolutionary system that creates a living, evolving relationship between
 * player and coach. The coach learns, remembers, and grows with the player.
 */

export interface MemoryMoment {
  id: string;
  type: 'epic_play' | 'terrible_mistake' | 'clutch_moment' | 'funny_moment' | 'learning_moment';
  timestamp: Date;
  description: string;
  context: {
    champion: string;
    role: string;
    enemy: string;
    kda?: string;
    gold?: number;
  };
  emotionalWeight: number; // 0-100, how important this moment is
  coachReaction: string;
}

export interface PersonalityEvolution {
  stage: 'stranger' | 'acquaintance' | 'friend' | 'best_friend' | 'legend';
  interactionCount: number;
  personalJokes: string[];
  personalInsideReferences: string[];
  personalizedGreetings: string[];
  trustLevel: number; // 0-100
  sharedExperiences: string[];
}

export interface SkillProfile {
  mechanics: number; // 0-100
  macroPlay: number; // 0-100
  decisionMaking: number; // 0-100
  consistency: number; // 0-100
  clutchFactor: number; // 0-100
  overallRating: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
}

export interface FlowState {
  isInFlow: boolean;
  flowScore: number; // 0-100
  consecutiveGoodDecisions: number;
  winStreak: number;
  timeInFlow: number; // minutes
  confidence: number; // 0-100
  focusLevel: number; // 0-100
}

export interface CoachOSState {
  playerId: string;
  memoryMoments: MemoryMoment[];
  personalityEvolution: PersonalityEvolution;
  skillProfile: SkillProfile;
  flowState: FlowState;
  totalMatchesAnalyzed: number;
  daysSinceFirstMeeting: number;
  relationshipScore: number; // 0-100
}

export class CoachOS {
  private state: CoachOSState;

  constructor(playerId: string) {
    this.state = {
      playerId,
      memoryMoments: [],
      personalityEvolution: {
        stage: 'stranger',
        interactionCount: 0,
        personalJokes: [],
        personalInsideReferences: [],
        personalizedGreetings: [],
        trustLevel: 0,
        sharedExperiences: [],
      },
      skillProfile: {
        mechanics: 50,
        macroPlay: 50,
        decisionMaking: 50,
        consistency: 50,
        clutchFactor: 50,
        overallRating: 50,
        trend: 'stable',
        strengths: [],
        weaknesses: [],
        lastUpdated: new Date(),
      },
      flowState: {
        isInFlow: false,
        flowScore: 0,
        consecutiveGoodDecisions: 0,
        winStreak: 0,
        timeInFlow: 0,
        confidence: 50,
        focusLevel: 50,
      },
      totalMatchesAnalyzed: 0,
      daysSinceFirstMeeting: 0,
      relationshipScore: 0,
    };
  }

  /**
   * Record a memorable moment in the game
   */
  recordMemoryMoment(moment: Omit<MemoryMoment, 'id' | 'timestamp'>): MemoryMoment {
    const newMoment: MemoryMoment = {
      ...moment,
      id: `moment_${Date.now()}`,
      timestamp: new Date(),
    };

    this.state.memoryMoments.push(newMoment);

    // Update personality based on moment
    this.updatePersonalityFromMoment(newMoment);

    // Add to shared experiences
    this.state.personalityEvolution.sharedExperiences.push(moment.description);

    return newMoment;
  }

  /**
   * Update personality evolution based on interactions
   */
  private updatePersonalityFromMoment(moment: MemoryMoment): void {
    const evolution = this.state.personalityEvolution;

    // Increase interaction count
    evolution.interactionCount++;

    // Update trust level based on moment type
    if (moment.type === 'epic_play' || moment.type === 'clutch_moment') {
      evolution.trustLevel = Math.min(100, evolution.trustLevel + 5);
    }

    // Create inside jokes from repeated patterns
    if (this.state.memoryMoments.length > 5) {
      const recentMoments = this.state.memoryMoments.slice(-5);
      const commonChampion = this.getMostCommonChampion(recentMoments);
      
      if (commonChampion && !evolution.personalJokes.includes(commonChampion)) {
        evolution.personalJokes.push(`Your ${commonChampion} is getting scary good!`);
      }
    }

    // Update stage based on interaction count
    if (evolution.interactionCount < 10) {
      evolution.stage = 'stranger';
    } else if (evolution.interactionCount < 25) {
      evolution.stage = 'acquaintance';
    } else if (evolution.interactionCount < 50) {
      evolution.stage = 'friend';
    } else if (evolution.interactionCount < 100) {
      evolution.stage = 'best_friend';
    } else {
      evolution.stage = 'legend';
    }
  }

  /**
   * Update skill profile based on match data
   */
  updateSkillProfile(matchData: {
    mechanics: number;
    macroPlay: number;
    decisionMaking: number;
    clutchFactor: number;
    result: 'win' | 'loss';
  }): void {
    const profile = this.state.skillProfile;
    const alpha = 0.3; // Learning rate

    // Update skills with exponential moving average
    profile.mechanics = profile.mechanics * (1 - alpha) + matchData.mechanics * alpha;
    profile.macroPlay = profile.macroPlay * (1 - alpha) + matchData.macroPlay * alpha;
    profile.decisionMaking = profile.decisionMaking * (1 - alpha) + matchData.decisionMaking * alpha;
    profile.clutchFactor = profile.clutchFactor * (1 - alpha) + matchData.clutchFactor * alpha;

    // Calculate overall rating
    profile.overallRating =
      (profile.mechanics +
        profile.macroPlay +
        profile.decisionMaking +
        profile.consistency +
        profile.clutchFactor) /
      5;

    // Determine trend
    const previousRating = profile.overallRating;
    if (profile.overallRating > previousRating + 2) {
      profile.trend = 'improving';
    } else if (profile.overallRating < previousRating - 2) {
      profile.trend = 'declining';
    } else {
      profile.trend = 'stable';
    }

    // Identify strengths and weaknesses
    profile.strengths = this.identifyStrengths(profile);
    profile.weaknesses = this.identifyWeaknesses(profile);

    profile.lastUpdated = new Date();
    this.state.totalMatchesAnalyzed++;
  }

  /**
   * Detect if player is in flow state
   */
  updateFlowState(data: {
    consecutiveWins: number;
    decisionQuality: number; // 0-100
    confidence: number; // 0-100
    focusLevel: number; // 0-100
  }): FlowState {
    const flow = this.state.flowState;

    flow.consecutiveGoodDecisions = data.decisionQuality > 75 ? flow.consecutiveGoodDecisions + 1 : 0;
    flow.winStreak = data.consecutiveWins;
    flow.confidence = data.confidence;
    flow.focusLevel = data.focusLevel;

    // Calculate flow score
    flow.flowScore =
      (flow.consecutiveGoodDecisions * 2 + flow.winStreak * 3 + data.confidence + data.focusLevel) / 7;

    // Determine if in flow (threshold: 70+)
    flow.isInFlow = flow.flowScore >= 70;

    if (flow.isInFlow) {
      flow.timeInFlow++;
    }

    return flow;
  }

  /**
   * Get personalized greeting based on relationship stage
   */
  getPersonalizedGreeting(coachPersonality: string): string {
    const evolution = this.state.personalityEvolution;
    const stage = evolution.stage;

    const greetings = {
      stranger: [
        `Hey there! Ready to improve today?`,
        `Welcome back! Let's see what we can work on.`,
        `Good to see you. Let's get started!`,
      ],
      acquaintance: [
        `Hey! Good to see you again. Let's go!`,
        `Welcome back, friend. Ready to climb?`,
        `You're back! I've been looking forward to this.`,
      ],
      friend: [
        `My friend! Let's show them what we're made of!`,
        `You know I got your back. Let's do this!`,
        `Ready to crush it together?`,
      ],
      best_friend: [
        `Yo! My guy! Let's go legend hunting!`,
        `You know the drill. Let's make today legendary!`,
        `I've been waiting for this. Let's show them!`,
      ],
      legend: [
        `THE LEGEND RETURNS! Let's go make history!`,
        `You're back! I knew you'd be. Let's be unstoppable!`,
        `Welcome home, champion. Time to dominate!`,
      ],
    };

    const stageGreetings = greetings[stage];
    return stageGreetings[Math.floor(Math.random() * stageGreetings.length)];
  }

  /**
   * Get a personalized inside joke
   */
  getPersonalJoke(): string {
    const jokes = this.state.personalityEvolution.personalJokes;
    if (jokes.length === 0) {
      return 'You\'re getting better every day!';
    }
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  /**
   * Get memory highlights for the session
   */
  getMemoryHighlights(limit: number = 5): MemoryMoment[] {
    return this.state.memoryMoments
      .sort((a, b) => b.emotionalWeight - a.emotionalWeight)
      .slice(0, limit);
  }

  /**
   * Calculate relationship score
   */
  calculateRelationshipScore(): number {
    const evolution = this.state.personalityEvolution;
    const flow = this.state.flowState;
    const skill = this.state.skillProfile;

    const stageScore = {
      stranger: 10,
      acquaintance: 25,
      friend: 50,
      best_friend: 75,
      legend: 100,
    };

    const relationshipScore =
      (stageScore[evolution.stage] * 0.4 +
        evolution.trustLevel * 0.3 +
        flow.flowScore * 0.2 +
        (skill.overallRating / 100) * 10 * 0.1) /
      2;

    this.state.relationshipScore = Math.round(relationshipScore);
    return this.state.relationshipScore;
  }

  /**
   * Helper: Identify strengths
   */
  private identifyStrengths(profile: SkillProfile): string[] {
    const strengths: string[] = [];
    if (profile.mechanics > 70) strengths.push('Mechanics');
    if (profile.macroPlay > 70) strengths.push('Macro Play');
    if (profile.decisionMaking > 70) strengths.push('Decision Making');
    if (profile.clutchFactor > 70) strengths.push('Clutch Factor');
    return strengths;
  }

  /**
   * Helper: Identify weaknesses
   */
  private identifyWeaknesses(profile: SkillProfile): string[] {
    const weaknesses: string[] = [];
    if (profile.mechanics < 40) weaknesses.push('Mechanics');
    if (profile.macroPlay < 40) weaknesses.push('Macro Play');
    if (profile.decisionMaking < 40) weaknesses.push('Decision Making');
    if (profile.consistency < 40) weaknesses.push('Consistency');
    return weaknesses;
  }

  /**
   * Helper: Get most common champion
   */
  private getMostCommonChampion(moments: MemoryMoment[]): string | null {
    const champions = moments.map((m) => m.context.champion);
    const counts = champions.reduce(
      (acc, champ) => {
        acc[champ] = (acc[champ] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? mostCommon[0] : null;
  }

  /**
   * Get full CoachOS state
   */
  getState(): CoachOSState {
    return this.state;
  }

  /**
   * Save state to localStorage
   */
  saveToLocalStorage(): void {
    localStorage.setItem(`coachOS_${this.state.playerId}`, JSON.stringify(this.state));
  }

  /**
   * Load state from localStorage
   */
  loadFromLocalStorage(): void {
    const saved = localStorage.getItem(`coachOS_${this.state.playerId}`);
    if (saved) {
      this.state = JSON.parse(saved);
    }
  }
}

export default CoachOS;
