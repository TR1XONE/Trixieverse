import React, { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakTrackerProps {
  current: number;
  best: number;
  lastUpdate?: Date;
}

export default function StreakTracker({
  current,
  best,
  lastUpdate,
}: StreakTrackerProps) {
  const [isOnFire, setIsOnFire] = useState(current >= 3);

  useEffect(() => {
    setIsOnFire(current >= 3);
  }, [current]);

  const getStreakColor = () => {
    if (current >= 10) return 'from-red-600 to-orange-600';
    if (current >= 5) return 'from-orange-500 to-yellow-500';
    if (current >= 3) return 'from-yellow-400 to-orange-400';
    return 'from-gray-600 to-gray-700';
  };

  const getStreakMessage = () => {
    if (current === 0) return '🎮 Ready to climb!';
    if (current === 1) return '💪 Building momentum!';
    if (current === 2) return '⚡ Getting hot!';
    if (current === 3) return '🔥 On fire!';
    if (current === 5) return '🌊 Unstoppable!';
    if (current === 10) return '⚔️ LEGENDARY!';
    return `🔥 ${current} in a row!`;
  };

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <div
        className={`bg-gradient-to-r ${getStreakColor()} p-6 rounded-lg shadow-lg border-2 border-yellow-400 relative overflow-hidden`}
      >
        {/* Background animation */}
        {isOnFire && (
          <>
            <div className="absolute inset-0 opacity-10 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white"></div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </>
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="text-center">
            {/* Main streak number */}
            <div className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
              {current}
            </div>

            {/* Message */}
            <div className="text-lg font-semibold text-white mb-2 drop-shadow">
              {getStreakMessage()}
            </div>

            {/* Subtext */}
            {current > 0 && (
              <div className="text-sm text-white opacity-90">
                Consecutive wins in a row!
              </div>
            )}
          </div>

          {/* Streak progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Progress to 10
              </span>
              <span className="text-xs text-white opacity-75">{current}/10</span>
            </div>
            <div className="w-full bg-black bg-opacity-30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${(current / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 p-4 rounded-lg border border-cyan-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Current Streak
              </div>
              <div className="text-3xl font-bold text-cyan-400 mt-1">{current}</div>
            </div>
            <Flame
              className={`w-8 h-8 ${
                isOnFire ? 'text-orange-400 animate-bounce' : 'text-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg border border-purple-500 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">
                Best Streak
              </div>
              <div className="text-3xl font-bold text-purple-400 mt-1">{best}</div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="bg-gray-900 bg-opacity-50 p-4 rounded-lg border border-gray-700">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
          🏅 Streak Milestones
        </h4>
        <div className="space-y-2">
          {[
            { count: 3, reward: '🔥 Hot Hand', unlocked: current >= 3 || best >= 3 },
            { count: 5, reward: '⚡ On Fire!', unlocked: current >= 5 || best >= 5 },
            { count: 10, reward: '⚔️ Legendary', unlocked: current >= 10 || best >= 10 },
            { count: 15, reward: '👑 Unstoppable', unlocked: current >= 15 || best >= 15 },
            { count: 20, reward: '✨ UNTOUCHABLE', unlocked: current >= 20 || best >= 20 },
          ].map((milestone) => (
            <div
              key={milestone.count}
              className={`flex items-center justify-between p-2 rounded ${
                milestone.unlocked
                  ? 'bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              <div className="text-sm">
                <span className="font-semibold">
                  {milestone.count} wins
                </span>
              </div>
              <div
                className={`text-sm font-bold ${
                  milestone.unlocked ? 'text-yellow-400' : 'text-gray-500'
                }`}
              >
                {milestone.reward}
              </div>
              {milestone.unlocked && <div className="text-lg">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
