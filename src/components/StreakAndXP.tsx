import React from 'react';
import { Flame, Zap, TrendingUp, Award } from 'lucide-react';

interface StreakData {
  loginStreak: number;
  loginRecord: number;
  winStreak: number;
  winRecord: number;
  lastLogin: Date;
}

interface XPData {
  currentXP: number;
  maxXP: number;
  level: number;
  totalXP: number;
}

export default function StreakAndXP() {
  const [streakData] = React.useState<StreakData>({
    loginStreak: 7,
    loginRecord: 15,
    winStreak: 3,
    winRecord: 8,
    lastLogin: new Date(),
  });

  const [xpData] = React.useState<XPData>({
    currentXP: 750,
    maxXP: 1000,
    level: 12,
    totalXP: 11750,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Streak */}
        <div className="coaching-card p-6 neon-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">
              Login Streak
            </h3>
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>

          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-orange-500 mb-2">{streakData.loginStreak}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Days in a row</div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{streakData.loginRecord}</div>
              <div className="text-xs text-muted-foreground uppercase">Record</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {streakData.loginStreak >= 7 ? '🔥' : '❄️'}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Status</div>
            </div>
          </div>
        </div>

        {/* Win Streak */}
        <div className="coaching-card p-6 neon-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">
              Win Streak
            </h3>
            <TrendingUp className="w-6 h-6 text-cyan-500" />
          </div>

          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-cyan-500 mb-2">{streakData.winStreak}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Games in a row</div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">{streakData.winRecord}</div>
              <div className="text-xs text-muted-foreground uppercase">Record</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {streakData.winStreak >= 3 ? '🚀' : '🎮'}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* XP & Level System */}
      <div className="coaching-card p-8 neon-glow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-sm flex items-center justify-center border-2 border-primary/50 shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">{xpData.level}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground uppercase tracking-wider">
                Level {xpData.level}
              </h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {xpData.totalXP} Total XP Earned
              </p>
            </div>
          </div>
          <Award className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
            <span className="text-muted-foreground">Progress to Level {xpData.level + 1}</span>
            <span className="text-primary">
              {xpData.currentXP} / {xpData.maxXP} XP
            </span>
          </div>
          
          <div className="w-full bg-muted/30 rounded-sm h-4 overflow-hidden border border-primary/30 p-0.5">
            <div
              className="bg-gradient-to-r from-primary via-secondary to-accent h-full transition-all duration-1000 relative"
              style={{
                width: `${(xpData.currentXP / xpData.maxXP) * 100}%`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                +50 XP per win
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                +10 XP per tip
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                +100 XP per goal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
