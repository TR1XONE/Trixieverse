import React from 'react';
import { Sparkles, AlertCircle, Zap, Laugh } from 'lucide-react';

interface MemoryMoment {
  id: string;
  type: 'epic_play' | 'terrible_mistake' | 'clutch_moment' | 'funny_moment' | 'learning_moment';
  timestamp: Date;
  description: string;
  context: {
    champion: string;
    role: string;
    enemy: string;
  };
  emotionalWeight: number;
  coachReaction: string;
}

interface MemoryMomentsDisplayProps {
  moments: MemoryMoment[];
  coachName: string;
}

export default function MemoryMomentsDisplay({ moments, coachName }: MemoryMomentsDisplayProps) {
  const getMomentIcon = (type: string) => {
    switch (type) {
      case 'epic_play':
        return '⚡';
      case 'terrible_mistake':
        return '💥';
      case 'clutch_moment':
        return '🔥';
      case 'funny_moment':
        return '😂';
      case 'learning_moment':
        return '💡';
      default:
        return '✨';
    }
  };

  const getMomentColor = (type: string) => {
    switch (type) {
      case 'epic_play':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'terrible_mistake':
        return 'border-red-500/50 bg-red-500/10';
      case 'clutch_moment':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'funny_moment':
        return 'border-pink-500/50 bg-pink-500/10';
      case 'learning_moment':
        return 'border-cyan-500/50 bg-cyan-500/10';
      default:
        return 'border-primary/50 bg-primary/10';
    }
  };

  const getMomentTitle = (type: string) => {
    switch (type) {
      case 'epic_play':
        return 'Epic Play';
      case 'terrible_mistake':
        return 'Learning Moment';
      case 'clutch_moment':
        return 'Clutch Moment';
      case 'funny_moment':
        return 'Funny Moment';
      case 'learning_moment':
        return 'Key Learning';
      default:
        return 'Memory';
    }
  };

  if (moments.length === 0) {
    return (
      <div className="coaching-card p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 neon-glow text-center">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-bold uppercase tracking-wider">No memories yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Play some matches and your coach will start remembering your best moments!
        </p>
      </div>
    );
  }

  return (
    <div className="coaching-card p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 neon-glow">
      <h3 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-6 h-6" />
        Coach's Memories
      </h3>

      <div className="space-y-4">
        {moments.slice(0, 5).map((moment) => (
          <div
            key={moment.id}
            className={`rounded-sm p-4 border-2 transition-all hover:shadow-lg ${getMomentColor(moment.type)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getMomentIcon(moment.type)}</span>
                <div>
                  <p className="font-bold text-foreground uppercase tracking-wider">
                    {getMomentTitle(moment.type)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {moment.context.champion} vs {moment.context.enemy}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {moment.emotionalWeight}% important
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-foreground mb-3 text-sm">{moment.description}</p>

            {/* Coach reaction */}
            <div className="bg-black/20 rounded-sm p-3 border border-white/10">
              <p className="text-sm text-foreground italic">"{moment.coachReaction}"</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                — {coachName} Coach
              </p>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-3">
              {moment.timestamp.toLocaleDateString()} at {moment.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {moments.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            +{moments.length - 5} more memories stored in your coach's memory
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 rounded-sm bg-muted/20 border border-muted/30">
        <p className="text-xs text-muted-foreground">
          💜 Your coach remembers every important moment. These memories help create inside jokes and personalized coaching!
        </p>
      </div>
    </div>
  );
}
