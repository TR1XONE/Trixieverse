import React, { useState, useEffect } from 'react';
import { useCoach } from '@/contexts/CoachContext';
import { Button } from '@/components/ui/button';
import { Wand2, MessageSquare, Volume2 } from 'lucide-react';

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
}

const COACH_PERSONALITIES = {
  Sage: {
    description: 'Calm, analytical, supportive',
    emoji: '🧙',
    traits: ['Thoughtful', 'Patient', 'Insightful'],
    color: 'from-purple-600 to-blue-600',
    accent: 'text-purple-400',
  },
  Blaze: {
    description: 'Energetic, competitive, motivating',
    emoji: '🔥',
    traits: ['Enthusiastic', 'Competitive', 'Motivating'],
    color: 'from-orange-600 to-red-600',
    accent: 'text-orange-400',
  },
  Echo: {
    description: 'Mysterious, observant, insightful',
    emoji: '🌀',
    traits: ['Observant', 'Deep', 'Mysterious'],
    color: 'from-cyan-600 to-blue-600',
    accent: 'text-cyan-400',
  },
  Nova: {
    description: 'Friendly, humorous, relatable',
    emoji: '⭐',
    traits: ['Funny', 'Relatable', 'Friendly'],
    color: 'from-yellow-600 to-orange-600',
    accent: 'text-yellow-400',
  },
};

export default function CoachPersonality() {
  const { userProfile } = useCoach();
  const [selectedPersonality, setSelectedPersonality] = useState<CoachPersonality>({
    name: 'Sage',
    accent: 'neutral',
    personality: 'supportive',
    responseLength: 'medium',
    celebrationLevel: 'moderate',
  });

  const [coachMemory, setCoachMemory] = useState<CoachMemory>({
    playerName: userProfile?.name || 'Champion',
    favoriteChampions: userProfile?.championPool || [],
    playStyle: 'aggressive',
    strengths: [],
    weaknesses: [],
    personalGoals: [],
    recentMatches: [],
    milestones: [],
    emotionalState: 'neutral',
    firstMeetDate: new Date(),
    totalInteractions: 0,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('coachPersonality');
    if (saved) {
      setSelectedPersonality(JSON.parse(saved));
    }
    const savedMemory = localStorage.getItem('coachMemory');
    if (savedMemory) {
      setCoachMemory(JSON.parse(savedMemory));
    }
  }, []);

  const handleSavePersonality = () => {
    localStorage.setItem('coachPersonality', JSON.stringify(selectedPersonality));
    localStorage.setItem('coachMemory', JSON.stringify(coachMemory));
    alert('Coach personality saved! 🎉');
  };

  const generatePreview = () => {
    const previews = {
      Sage: [
        `Hey ${coachMemory.playerName}! Let me analyze this situation for you systematically. I've noticed your ${coachMemory.playStyle} playstyle is strong, but let's refine it further.`,
        `I've been observing your journey. Your strengths in ${coachMemory.strengths[0] || 'mechanics'} are impressive. Here's what I think we should focus on next...`,
      ],
      Blaze: [
        `YOOO ${coachMemory.playerName}! LET'S GOOOO! 🔥 Your ${coachMemory.playStyle} playstyle is INSANE! I'm hyped to see what you'll do next!`,
        `${coachMemory.playerName}! You're ON FIRE! 🚀 I LOVE the energy! Keep climbing, you're unstoppable!`,
      ],
      Echo: [
        `I sense something powerful in you, ${coachMemory.playerName}. Your journey has been remarkable. Let's unlock your true potential together...`,
        `There's a pattern I've noticed in your playstyle. Something deeper we should explore. Are you ready?`,
      ],
      Nova: [
        `Hey ${coachMemory.playerName}! 😄 You know what? I got you! Let's make this fun AND effective. Your ${coachMemory.playStyle} style is awesome!`,
        `Haha, I love your energy ${coachMemory.playerName}! Let's crush some games together and have a blast doing it!`,
      ],
    };

    const messages = previews[selectedPersonality.name];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setPreviewMessage(randomMessage);
    setShowPreview(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Wand2 className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold text-foreground uppercase tracking-wider">
            Meet Your Coach
          </h1>
          <Wand2 className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-foreground text-lg">Customize your personal AI coach to match your style</p>
      </div>

      {/* Personality Selection Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider">Choose Your Coach</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(COACH_PERSONALITIES).map(([name, data]) => (
            <button
              key={name}
              onClick={() => setSelectedPersonality({ ...selectedPersonality, name: name as any })}
              className={`coaching-card p-6 text-center transition-all duration-300 neon-glow ${
                selectedPersonality.name === name
                  ? `border-primary/80 bg-gradient-to-br ${data.color} bg-opacity-10`
                  : 'border-primary/30 hover:border-primary/60'
              }`}
            >
              <div className="text-5xl mb-3">{data.emoji}</div>
              <h3 className={`font-bold text-lg uppercase tracking-wider mb-1 ${data.accent}`}>
                {name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">{data.description}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {data.traits.map((trait) => (
                  <span
                    key={trait}
                    className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-sm font-bold"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accent Selection */}
        <div className="coaching-card p-6 neon-glow">
          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Coach Accent
          </h3>
          <div className="space-y-2">
            {(['neutral', 'swedish', 'british', 'casual'] as const).map((accent) => (
              <button
                key={accent}
                onClick={() => setSelectedPersonality({ ...selectedPersonality, accent })}
                className={`w-full px-4 py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
                  selectedPersonality.accent === accent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/30 text-foreground hover:bg-muted/50'
                }`}
              >
                {accent.charAt(0).toUpperCase() + accent.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Response Style Selection */}
        <div className="coaching-card p-6 neon-glow">
          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Response Style
          </h3>
          <div className="space-y-2">
            {(['supportive', 'competitive', 'analytical', 'funny'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedPersonality({ ...selectedPersonality, personality: style })}
                className={`w-full px-4 py-3 rounded-sm font-bold uppercase tracking-wider transition-all text-left ${
                  selectedPersonality.personality === style
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted/30 text-foreground hover:bg-muted/50'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Length & Celebration Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="coaching-card p-6 neon-glow">
          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
            Message Length
          </h3>
          <div className="space-y-2">
            {(['short', 'medium', 'long'] as const).map((length) => (
              <button
                key={length}
                onClick={() => setSelectedPersonality({ ...selectedPersonality, responseLength: length })}
                className={`w-full px-4 py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
                  selectedPersonality.responseLength === length
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted/30 text-foreground hover:bg-muted/50'
                }`}
              >
                {length === 'short' && '💬 Quick Tips'}
                {length === 'medium' && '💭 Balanced Advice'}
                {length === 'long' && '📖 Detailed Analysis'}
              </button>
            ))}
          </div>
        </div>

        <div className="coaching-card p-6 neon-glow">
          <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
            Celebration Level
          </h3>
          <div className="space-y-2">
            {(['subtle', 'moderate', 'enthusiastic'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedPersonality({ ...selectedPersonality, celebrationLevel: level })}
                className={`w-full px-4 py-3 rounded-sm font-bold uppercase tracking-wider transition-all ${
                  selectedPersonality.celebrationLevel === level
                    ? 'bg-orange-500 text-white'
                    : 'bg-muted/30 text-foreground hover:bg-muted/50'
                }`}
              >
                {level === 'subtle' && '😊 Calm & Composed'}
                {level === 'moderate' && '🎉 Happy & Supportive'}
                {level === 'enthusiastic' && '🚀 HYPED & FIRED UP'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coach Memory Info */}
      <div className="coaching-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 neon-glow">
        <h3 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider">Coach Memory</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-card p-4 rounded-sm border border-primary/30">
            <div className="text-2xl font-bold text-primary">{coachMemory.playerName}</div>
            <div className="text-xs text-muted-foreground mt-1">Your Name</div>
          </div>
          <div className="bg-card p-4 rounded-sm border border-primary/30">
            <div className="text-2xl font-bold text-secondary">{coachMemory.favoriteChampions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Champions</div>
          </div>
          <div className="bg-card p-4 rounded-sm border border-primary/30">
            <div className="text-2xl font-bold text-accent">{coachMemory.totalInteractions}</div>
            <div className="text-xs text-muted-foreground mt-1">Interactions</div>
          </div>
          <div className="bg-card p-4 rounded-sm border border-primary/30">
            <div className="text-2xl font-bold text-orange-400">
              {Math.floor((Date.now() - coachMemory.firstMeetDate.getTime()) / (1000 * 60 * 60 * 24))}d
            </div>
            <div className="text-xs text-muted-foreground mt-1">Days Together</div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="coaching-card p-6 bg-gradient-to-br from-secondary/10 to-accent/10 neon-glow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Coach Preview</h3>
          <button
            onClick={generatePreview}
            className="gaming-button px-4 py-2 text-sm"
          >
            Generate Preview
          </button>
        </div>
        {showPreview && (
          <div className="bg-card p-4 rounded-sm border-2 border-primary/50 animate-in fade-in">
            <p className="text-foreground italic leading-relaxed">{previewMessage}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              — {selectedPersonality.name} Coach
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSavePersonality}
          className="flex-1 gaming-button py-4 text-lg font-bold"
        >
          💾 Save Coach Personality
        </button>
        <button
          className="flex-1 px-6 py-4 rounded-sm border-2 border-muted/50 hover:border-muted text-foreground font-bold uppercase tracking-wider transition-all"
        >
          🔄 Reset to Default
        </button>
      </div>

      {/* Info Section */}
      <div className="coaching-card p-6 border-l-4 border-primary">
        <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">💡 How It Works</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✨ Your coach learns your playstyle and adapts over time</li>
          <li>🧠 The memory system remembers your strengths and weaknesses</li>
          <li>🎯 Responses are personalized based on your preferences</li>
          <li>📈 Your coach celebrates your progress genuinely</li>
          <li>🤝 The more you interact, the better your coach understands you</li>
        </ul>
      </div>
    </div>
  );
}
