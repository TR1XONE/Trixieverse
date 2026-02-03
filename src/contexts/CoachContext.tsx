import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  mainRole: 'solo' | 'jungle' | 'mid' | 'duo' | 'support' | null;
  championPool: string[];
  currentRank: string;
  targetRank: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  metric: string;
  createdAt: Date;
  dueDate: Date;
  completed: boolean;
}

export interface MatchAnalysis {
  id: string;
  champion: string;
  role: string;
  enemies: string[];
  coachAdvice: string;
  itemRecommendations: string[];
  macroGoal: string;
  timestamp: Date;
}

export interface CoachPersonality {
  name: 'Sage' | 'Blaze' | 'Echo' | 'Nova';
  accent: 'neutral' | 'swedish' | 'british' | 'casual';
  personality: 'supportive' | 'competitive' | 'analytical' | 'funny';
  responseLength: 'short' | 'medium' | 'long';
  celebrationLevel: 'subtle' | 'moderate' | 'enthusiastic';
}

export interface CoachMemory {
  playerName: string;
  favoriteChampions: string[];
  playStyle: string;
  strengths: string[];
  weaknesses: string[];
  personalGoals: string[];
  recentMatches: MatchAnalysis[];
  milestones: any[];
  emotionalState: 'confident' | 'frustrated' | 'neutral';
  firstMeetDate: Date;
  totalInteractions: number;
  lastInteractionDate: Date;
  coachingNotes: string[];
}

export interface CoachContextType {
  userProfile: UserProfile | null;
  goals: Goal[];
  matchHistory: MatchAnalysis[];
  coachPersonality: CoachPersonality;
  coachMemory: CoachMemory;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  addMatchAnalysis: (analysis: Omit<MatchAnalysis, 'id' | 'timestamp'>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateCoachPersonality: (personality: CoachPersonality) => void;
  updateCoachMemory: (memory: Partial<CoachMemory>) => void;
  generateCoachResponse: (context: string) => Promise<string>;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

const DEFAULT_COACH_PERSONALITY: CoachPersonality = {
  name: 'Sage',
  accent: 'neutral',
  personality: 'supportive',
  responseLength: 'medium',
  celebrationLevel: 'moderate',
};

export const CoachProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchAnalysis[]>([]);
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality>(DEFAULT_COACH_PERSONALITY);
  const [coachMemory, setCoachMemory] = useState<CoachMemory>({
    playerName: 'Champion',
    favoriteChampions: [],
    playStyle: 'aggressive',
    strengths: [],
    weaknesses: [],
    personalGoals: [],
    recentMatches: [],
    milestones: [],
    emotionalState: 'neutral',
    firstMeetDate: new Date(),
    totalInteractions: 0,
    lastInteractionDate: new Date(),
    coachingNotes: [],
  });

  // Load from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage();
  }, [userProfile, goals, matchHistory, coachPersonality, coachMemory]);

  const loadFromStorage = () => {
    try {
      const savedProfile = localStorage.getItem('coachUserProfile');
      const savedGoals = localStorage.getItem('coachGoals');
      const savedMatches = localStorage.getItem('coachMatchHistory');
      const savedPersonality = localStorage.getItem('coachPersonality');
      const savedMemory = localStorage.getItem('coachMemory');

      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        // Initialize with default profile
        const defaultProfile: UserProfile = {
          id: 'user_' + Date.now(),
          name: 'Coach Player',
          mainRole: null,
          championPool: [],
          currentRank: 'Iron',
          targetRank: 'Legendary',
        };
        setUserProfile(defaultProfile);
      }

      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }

      if (savedMatches) {
        setMatchHistory(JSON.parse(savedMatches));
      }

      if (savedPersonality) {
        setCoachPersonality(JSON.parse(savedPersonality));
      }

      if (savedMemory) {
        const memory = JSON.parse(savedMemory);
        // Convert date strings back to Date objects
        memory.firstMeetDate = new Date(memory.firstMeetDate);
        memory.lastInteractionDate = new Date(memory.lastInteractionDate);
        setCoachMemory(memory);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const saveToStorage = () => {
    try {
      if (userProfile) {
        localStorage.setItem('coachUserProfile', JSON.stringify(userProfile));
      }
      localStorage.setItem('coachGoals', JSON.stringify(goals));
      localStorage.setItem('coachMatchHistory', JSON.stringify(matchHistory));
      localStorage.setItem('coachPersonality', JSON.stringify(coachPersonality));
      localStorage.setItem('coachMemory', JSON.stringify(coachMemory));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Date.now(),
      createdAt: new Date(),
    };
    setGoals([...goals, newGoal]);
    
    // Update coach memory with new goal
    updateCoachMemory({
      personalGoals: [...coachMemory.personalGoals, goal.title],
      totalInteractions: coachMemory.totalInteractions + 1,
      lastInteractionDate: new Date(),
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(goal => (goal.id === id ? { ...goal, ...updates } : goal)));
    
    // Update coach memory
    updateCoachMemory({
      totalInteractions: coachMemory.totalInteractions + 1,
      lastInteractionDate: new Date(),
    });
  };

  const addMatchAnalysis = (analysis: Omit<MatchAnalysis, 'id' | 'timestamp'>) => {
    const newAnalysis: MatchAnalysis = {
      ...analysis,
      id: 'match_' + Date.now(),
      timestamp: new Date(),
    };
    setMatchHistory([newAnalysis, ...matchHistory]);
    
    // Update coach memory with recent match
    updateCoachMemory({
      recentMatches: [newAnalysis, ...coachMemory.recentMatches].slice(0, 10),
      totalInteractions: coachMemory.totalInteractions + 1,
      lastInteractionDate: new Date(),
    });
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (userProfile) {
      const updated = { ...userProfile, ...profile };
      setUserProfile(updated);
      
      // Update coach memory with new profile info
      updateCoachMemory({
        playerName: updated.name,
        favoriteChampions: updated.championPool,
      });
    }
  };

  const updateCoachPersonality = (personality: CoachPersonality) => {
    setCoachPersonality(personality);
  };

  const updateCoachMemory = (memory: Partial<CoachMemory>) => {
    setCoachMemory(prev => ({
      ...prev,
      ...memory,
    }));
  };

  const generateCoachResponse = async (context: string): Promise<string> => {
    // This will be replaced with actual API call to backend
    // For now, return template-based responses
    const templates = {
      Sage: [
        `Let me analyze this for you, ${coachMemory.playerName}...`,
        `I've observed something important about your ${coachMemory.playStyle} playstyle...`,
        `Here's what I think we should focus on...`,
      ],
      Blaze: [
        `YOOO ${coachMemory.playerName}! That was INSANE! 🔥`,
        `Let's GO! You're ON FIRE!`,
        `I LOVE the energy! Keep it up!`,
      ],
      Echo: [
        `I sense something powerful in you, ${coachMemory.playerName}...`,
        `There's a pattern I've noticed...`,
        `Let's explore something deeper...`,
      ],
      Nova: [
        `Hey ${coachMemory.playerName}! 😄 You know what? I got you!`,
        `Haha, that was hilarious!`,
        `Let's make this fun AND effective!`,
      ],
    };

    const responses = templates[coachPersonality.name];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const value: CoachContextType = {
    userProfile,
    goals,
    matchHistory,
    coachPersonality,
    coachMemory,
    addGoal,
    updateGoal,
    addMatchAnalysis,
    updateUserProfile,
    updateCoachPersonality,
    updateCoachMemory,
    generateCoachResponse,
    loadFromStorage,
    saveToStorage,
  };

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
};

export const useCoach = () => {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoach must be used within CoachProvider');
  }
  return context;
};
