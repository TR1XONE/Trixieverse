import React, { useState, useEffect } from 'react';
import { Achievement } from '@/systems/AchievementSystem';
import { Lock } from 'lucide-react';

interface AchievementBadgesProps {
  achievements: Achievement[];
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

export default function AchievementBadges({
  achievements,
  onAchievementUnlocked,
}: AchievementBadgesProps) {
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    const handleAchievementUnlocked = (event: Event) => {
      const customEvent = event as CustomEvent;
      const achievement = customEvent.detail;
      setRecentlyUnlocked(achievement);

      // Show notification for 3 seconds
      setTimeout(() => setRecentlyUnlocked(null), 3000);

      if (onAchievementUnlocked) {
        onAchievementUnlocked(achievement);
      }
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked);
    return () =>
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked);
  }, [onAchievementUnlocked]);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'from-gray-400 to-gray-600',
      uncommon: 'from-green-400 to-green-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-red-600',
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'border-gray-500',
      uncommon: 'border-green-500',
      rare: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-yellow-500',
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div className="space-y-6">
      {/* Recently Unlocked Notification */}
      {recentlyUnlocked && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className={`bg-gradient-to-r ${getRarityColor(recentlyUnlocked.rarity)} p-4 rounded-lg shadow-lg border-2 ${getRarityBorder(recentlyUnlocked.rarity)}`}>
            <div className="text-white text-center">
              <div className="text-4xl mb-2">{recentlyUnlocked.icon}</div>
              <div className="font-bold">{recentlyUnlocked.name}</div>
              <div className="text-sm opacity-90">🎉 Achievement Unlocked!</div>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-wider">
            🏆 Unlocked Achievements ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`group bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-4 rounded-lg shadow-lg border-2 ${getRarityBorder(achievement.rarity)} hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                    {achievement.icon}
                  </div>
                  <div className="font-bold text-white text-sm">{achievement.name}</div>
                  <div className="text-xs text-white opacity-75 mt-1">
                    {new Date(achievement.unlockedAt || new Date()).toLocaleDateString()}
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-purple-400 mb-4 uppercase tracking-wider">
            🔒 Locked Achievements ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="group relative bg-gray-800 bg-opacity-50 p-4 rounded-lg shadow-lg border-2 border-gray-600 hover:border-gray-400 transition-all"
              >
                <div className="text-center opacity-50">
                  <div className="text-3xl mb-2 filter grayscale">{achievement.icon}</div>
                  <div className="font-bold text-gray-400 text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-500 mt-1">???</div>
                </div>

                {/* Lock icon */}
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>

                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs p-2 rounded whitespace-normal z-10 w-32">
                  <div className="font-bold">{achievement.name}</div>
                  <div className="text-gray-300">{achievement.requirement}</div>
                  {achievement.progress > 0 && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-cyan-400 h-1 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {Math.round(achievement.progress)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-cyan-900 to-purple-900 p-4 rounded-lg border border-cyan-500">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {unlockedAchievements.length}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wider">Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {lockedAchievements.length}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wider">Locked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wider">Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
