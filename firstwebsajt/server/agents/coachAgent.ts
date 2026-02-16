/**
 * Coach Agent - AI-driven personified coach
 * Handles personalized coaching responses, memory, and emotional intelligence
 */

interface CoachPersonality {
  name: 'Sage' | 'Blaze' | 'Echo' | 'Nova';
  accent: 'neutral' | 'swedish' | 'british' | 'casual';
  personality: 'supportive' | 'competitive' | 'analytical' | 'funny';
  responseLength: 'short' | 'medium' | 'long';
  celebrationLevel: 'subtle' | 'moderate' | 'enthusiastic';
}

interface CoachMemory {
  playerName: string;
  favoriteChampions: string[];
  playStyle: string;
  strengths: string[];
  weaknesses: string[];
  personalGoals: string[];
  recentMatches: any[];
  milestones: any[];
  emotionalState: 'confident' | 'frustrated' | 'neutral';
  firstMeetDate: Date;
  totalInteractions: number;
  lastInteractionDate: Date;
  coachingNotes: string[];
}

export class CoachAgent {
  private personality: CoachPersonality;
  private memory: CoachMemory;

  constructor(personality: CoachPersonality, memory: CoachMemory) {
    this.personality = personality;
    this.memory = memory;
  }

  /**
   * Generate a personalized coach response based on context
   */
  async generateResponse(context: {
    type: 'greeting' | 'match_analysis' | 'motivation' | 'goal_update' | 'achievement' | 'struggle';
    data?: any;
  }): Promise<string> {
    switch (context.type) {
      case 'greeting':
        return this.generateGreeting();
      case 'match_analysis':
        return this.generateMatchAnalysis(context.data);
      case 'motivation':
        return this.generateMotivation();
      case 'goal_update':
        return this.generateGoalUpdate(context.data);
      case 'achievement':
        return this.generateAchievementCelebration(context.data);
      case 'struggle':
        return this.generateComfort(context.data);
      default:
        return this.generateGenericResponse();
    }
  }

  /**
   * Generate a personalized greeting
   */
  private generateGreeting(): string {
    const greetings = {
      Sage: [
        `Welcome back, ${this.memory.playerName}. I've been analyzing the meta while you were away. Shall we discuss your next moves?`,
        `Greetings, ${this.memory.playerName}. I sense you're ready for another climb. Let's make it count.`,
        `${this.memory.playerName}, your journey continues. I'm here to guide you through every step.`,
      ],
      Blaze: [
        `YOOO ${this.memory.playerName}! LET'S GOOOO! 🔥 Ready to crush some ranked?`,
        `${this.memory.playerName}! I've been HYPED waiting for you! Let's show them what you're made of!`,
        `WELCOME BACK, CHAMPION! 🚀 Time to climb and dominate!`,
      ],
      Echo: [
        `I've been waiting for you, ${this.memory.playerName}. The path to mastery awaits.`,
        `Your presence is felt, ${this.memory.playerName}. Shall we continue our journey?`,
        `${this.memory.playerName}... I sense great potential in you today.`,
      ],
      Nova: [
        `Hey ${this.memory.playerName}! 😄 Missed you! Ready to have some fun while climbing?`,
        `${this.memory.playerName}! You're back! Let's make today awesome! 🎮`,
        `Haha, good to see you ${this.memory.playerName}! Let's get this bread! 💪`,
      ],
    };

    const personalityGreetings = greetings[this.personality.name];
    return personalityGreetings[Math.floor(Math.random() * personalityGreetings.length)];
  }

  /**
   * Generate match analysis feedback
   */
  private generateMatchAnalysis(matchData: any): string {
    const { result, kda, cs, mistakes, highlights } = matchData;

    if (result === 'win') {
      return this.generateWinAnalysis(matchData);
    } else {
      return this.generateLossAnalysis(matchData);
    }
  }

  private generateWinAnalysis(matchData: any): string {
    const analyses = {
      Sage: [
        `Excellent work, ${this.memory.playerName}. Your ${matchData.cs} CS/min demonstrates improved farming efficiency. Let's maintain this momentum.`,
        `I've analyzed your positioning in that teamfight. Your decision-making was sound. Here's what we can refine further...`,
      ],
      Blaze: [
        `YOOOOO! THAT WAS INSANE! 🔥 Your KDA was FIRE! You're on an absolute TEAR!`,
        `${this.memory.playerName}! I LOVED that play! That's the energy I want to see! KEEP IT UP!`,
      ],
      Echo: [
        `Your victory reveals something deeper about your growth. The patterns are becoming clearer.`,
        `I sense a shift in your playstyle. This win is no accident. You're evolving.`,
      ],
      Nova: [
        `HAHA! That was HILARIOUS and AWESOME at the same time! 😂 Great job out there!`,
        `Dude, that play was CHEF'S KISS! 👌 You're getting better every game!`,
      ],
    };

    const analysis = analyses[this.personality.name];
    return analysis[Math.floor(Math.random() * analysis.length)];
  }

  private generateLossAnalysis(matchData: any): string {
    const analyses = {
      Sage: [
        `That loss was valuable, ${this.memory.playerName}. I noticed ${matchData.mistakes[0] || 'some positioning issues'}. Let's focus on this in your next game.`,
        `Don't be discouraged. Even the best players have losses. Here's what I observed...`,
      ],
      Blaze: [
        `Hey, even LEGENDS have bad games! 🔥 You got this! Let's learn and come back STRONGER!`,
        `That's okay, ${this.memory.playerName}! One loss doesn't define you! Let's analyze and DOMINATE next time!`,
      ],
      Echo: [
        `This loss carries a lesson. I sense frustration, but also opportunity for growth.`,
        `The path to mastery includes defeats. This is part of your evolution.`,
      ],
      Nova: [
        `Hey, it happens! 😄 Even the pros lose! Let's laugh it off and come back stronger!`,
        `One loss doesn't mean anything, ${this.memory.playerName}! You got this! 💪`,
      ],
    };

    const analysis = analyses[this.personality.name];
    return analysis[Math.floor(Math.random() * analysis.length)];
  }

  /**
   * Generate motivational message
   */
  private generateMotivation(): string {
    const motivations = {
      Sage: [
        `${this.memory.playerName}, I believe in your potential. Every great player started where you are now.`,
        `Remember why you started this journey. Your dedication will pay off.`,
      ],
      Blaze: [
        `YOU GOT THIS, ${this.memory.playerName}! 🚀 I BELIEVE IN YOU! LET'S GOOOOO!`,
        `Don't give up! You're STRONGER than you think! KEEP PUSHING! 💪`,
      ],
      Echo: [
        `Your potential is boundless, ${this.memory.playerName}. Trust the process.`,
        `I see greatness in your future. Keep walking this path.`,
      ],
      Nova: [
        `You're doing AMAZING, ${this.memory.playerName}! 😄 Keep being awesome!`,
        `Believe in yourself! You're way better than you think! 🎮`,
      ],
    };

    const motivation = motivations[this.personality.name];
    return motivation[Math.floor(Math.random() * motivation.length)];
  }

  /**
   * Generate goal update message
   */
  private generateGoalUpdate(goalData: any): string {
    const { goalTitle, progress, percentage } = goalData;

    const updates = {
      Sage: [
        `${this.memory.playerName}, you're ${percentage}% toward your goal of "${goalTitle}". Your consistency is impressive.`,
        `Progress update: You're making steady advancement on "${goalTitle}". Keep this pace.`,
      ],
      Blaze: [
        `YOOO! You're ${percentage}% done with "${goalTitle}"! YOU'RE CRUSHING IT! 🔥`,
        `${percentage}% TOWARD YOUR GOAL! I'm SO HYPED for you, ${this.memory.playerName}!`,
      ],
      Echo: [
        `Your journey toward "${goalTitle}" is ${percentage}% complete. The path becomes clearer.`,
        `I sense your determination. ${percentage}% progress on "${goalTitle}". You're on the right path.`,
      ],
      Nova: [
        `${percentage}% done with "${goalTitle}"! You're KILLING IT! 😄 Keep going!`,
        `Dude, you're almost there! ${percentage}% toward "${goalTitle}"! Let's finish this! 💪`,
      ],
    };

    const update = updates[this.personality.name];
    return update[Math.floor(Math.random() * update.length)];
  }

  /**
   * Generate achievement celebration
   */
  private generateAchievementCelebration(achievementData: any): string {
    const { achievementName, tier } = achievementData;

    const celebrations = {
      Sage: [
        `Congratulations, ${this.memory.playerName}. You've unlocked "${achievementName}". This marks your progress.`,
        `${achievementName} achieved. Your dedication continues to bear fruit.`,
      ],
      Blaze: [
        `YOOOOOOO!!! 🎉 YOU UNLOCKED "${achievementName}"!!! I'M SO PROUD OF YOU!!!`,
        `${this.memory.playerName}!!! THAT'S AMAZING!!! "${achievementName}" IS YOURS!!! 🚀`,
      ],
      Echo: [
        `"${achievementName}" is now yours. Another milestone in your ascension.`,
        `You've achieved "${achievementName}". The pattern of your growth continues.`,
      ],
      Nova: [
        `YESSS!!! 🎉 You got "${achievementName}"!!! That's SO COOL! 😄`,
        `Dude! "${achievementName}"! YOU'RE AWESOME! 🔥`,
      ],
    };

    const celebration = celebrations[this.personality.name];
    return celebration[Math.floor(Math.random() * celebration.length)];
  }

  /**
   * Generate comfort message for struggles
   */
  private generateComfort(struggleData: any): string {
    const { issue } = struggleData;

    const comforts = {
      Sage: [
        `${this.memory.playerName}, struggles are part of growth. Let's analyze this ${issue} together and find solutions.`,
        `I understand your frustration with ${issue}. This is an opportunity to improve. I'm here to help.`,
      ],
      Blaze: [
        `Hey ${this.memory.playerName}, I got you! 💪 We'll figure out this ${issue} together and come back STRONGER!`,
        `Don't worry! ${issue} is just a temporary setback! We'll crush it next time! 🔥`,
      ],
      Echo: [
        `I sense your struggle with ${issue}. But within struggle lies the seed of mastery.`,
        `${issue} is a teacher, ${this.memory.playerName}. Let's learn from it together.`,
      ],
      Nova: [
        `Hey, it's okay! 😄 ${issue} happens to everyone! We'll figure it out together!`,
        `Don't be sad! ${issue} is just a learning moment! You got this! 💪`,
      ],
    };

    const comfort = comforts[this.personality.name];
    return comfort[Math.floor(Math.random() * comfort.length)];
  }

  /**
   * Generate generic response
   */
  private generateGenericResponse(): string {
    const responses = {
      Sage: [
        `How can I assist you today, ${this.memory.playerName}?`,
        `What would you like to work on?`,
      ],
      Blaze: [
        `What's up, ${this.memory.playerName}? Let's DO THIS! 🔥`,
        `Ready to improve? Let's go!`,
      ],
      Echo: [
        `I'm listening, ${this.memory.playerName}.`,
        `What's on your mind?`,
      ],
      Nova: [
        `Yo ${this.memory.playerName}! What's up? 😄`,
        `What do you need help with?`,
      ],
    };

    const response = responses[this.personality.name];
    return response[Math.floor(Math.random() * response.length)];
  }

  /**
   * Update coach memory with new information
   */
  updateMemory(updates: Partial<CoachMemory>): void {
    this.memory = {
      ...this.memory,
      ...updates,
      lastInteractionDate: new Date(),
      totalInteractions: this.memory.totalInteractions + 1,
    };
  }

  /**
   * Get coach memory
   */
  getMemory(): CoachMemory {
    return this.memory;
  }

  /**
   * Get coach personality
   */
  getPersonality(): CoachPersonality {
    return this.personality;
  }

  /**
   * Update coach personality
   */
  setPersonality(personality: CoachPersonality): void {
    this.personality = personality;
  }
}

export default CoachAgent;
