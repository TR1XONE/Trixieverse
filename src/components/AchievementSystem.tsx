import React, { useState } from 'react';
import { Trophy, Star, Zap, Heart } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'skill' | 'milestone' | 'community' | 'seasonal';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_match',
    name: 'First Blood',
    description: 'Play your first match',
    icon: <Zap className="w-6 h-6" />,
    category: 'milestone',
    unlockedAt: new Date(),
  },
  {
    id: 'cs_master',
    name: 'CS Master',
    description: 'Maintain 6+ CS/min for 5 consecutive games',
    icon: <Star className="w-6 h-6" />,
    category: 'skill',
    progress: 3,
    maxProgress: 5,
  },
  {
    id: 'rank_climber',
    name: 'Rank Climber',
    description: 'Reach Gold rank',
    icon: <Trophy className="w-6 h-6" />,
    category: 'milestone',
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Play with same teammate 10 times',
    icon: <Heart className="w-6 h-6" />,
    category: 'community',
    progress: 7,
    maxProgress: 10,
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after being 0-5 in KDA',
    icon: <Zap className="w-6 h-6" />,
    category: 'skill',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help 3 friends reach their goal',
    icon: <Heart className="w-6 h-6" />,
    category: 'community',
    progress: 1,
    maxProgress: 3,
  },
];

export default function AchievementSystem() {
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const progressCount = achievements.filter(a => a.progress !== undefined && a.maxProgress !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2 uppercase tracking-wider">
          🏆 Achievements
        </h2>
        <p className="text-foreground">
          {unlockedCount} unlocked • {progressCount} in progress
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`coaching-card p-6 neon-glow transition-all duration-300 ${
              achievement.unlockedAt ? 'border-primary/80' : 'border-muted/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`text-4xl ${achievement.unlockedAt ? 'opacity-100' : 'opacity-30'}`}>
                {achievement.icon}
              </div>
              {achievement.unlockedAt && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-sm font-bold">
                  UNLOCKED
                </span>
              )}
            </div>

            <h3 className="font-bold text-foreground uppercase tracking-wider mb-1">
              {achievement.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

            {/* Progress Bar */}
            {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-bold">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-muted/30 rounded-sm h-2 overflow-hidden border border-primary/30">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500"
                    style={{
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Category Badge */}
            <div className="mt-3">
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-sm font-bold uppercase">
                {achievement.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="coaching-card p-6 text-center neon-glow">
          <div className="text-3xl font-bold text-primary mb-1">{unlockedCount}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">Unlocked</div>
        </div>
        <div className="coaching-card p-6 text-center neon-glow">
          <div className="text-3xl font-bold text-secondary mb-1">{progressCount}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">In Progress</div>
        </div>
        <div className="coaching-card p-6 text-center neon-glow">
          <div className="text-3xl font-bold text-accent mb-1">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider">Complete</div>
        </div>
      </div>
    </div>
  );
}
