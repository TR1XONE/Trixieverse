import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Heart, Loader } from 'lucide-react';
import axios from 'axios';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  rarity: string;
  icon_url: string;
  unlocked_at: Date;
  created_at: Date;
}

interface AchievementStats {
  total_achievements: number;
  common_count: number;
  rare_count: number;
  epic_count: number;
  legendary_count: number;
  skill_achievements: number;
  milestone_achievements: number;
  community_achievements: number;
  seasonal_achievements: number;
}

const rarityColors: { [key: string]: string } = {
  common: 'bg-gray-500/20 text-gray-400',
  rare: 'bg-blue-500/20 text-blue-400',
  epic: 'bg-purple-500/20 text-purple-400',
  legendary: 'bg-yellow-500/20 text-yellow-400',
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  skill: <Zap className="w-6 h-6" />,
  milestone: <Trophy className="w-6 h-6" />,
  community: <Heart className="w-6 h-6" />,
  seasonal: <Star className="w-6 h-6" />,
};

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setError('Not authenticated');
          return;
        }

        // Fetch achievements
        const achievementsRes = await axios.get('/api/achievements', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch stats
        const statsRes = await axios.get('/api/achievements/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAchievements(achievementsRes.data.data || []);
        setStats(statsRes.data.data || null);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching achievements:', err);
        setError(err.response?.data?.message || 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="coaching-card p-6 border-red-500/50 bg-red-500/10">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const unlockedCount = achievements.length;
  const totalAchievements = 10; // Total available achievements

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2 uppercase tracking-wider">
          🏆 Achievements
        </h2>
        <p className="text-foreground">
          {unlockedCount} unlocked • {totalAchievements - unlockedCount} remaining
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`coaching-card p-6 neon-glow transition-all duration-300 border-primary/80`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl opacity-100">
                {categoryIcons[achievement.achievement_type] || <Trophy className="w-6 h-6" />}
              </div>
              <span className={`text-xs px-2 py-1 rounded-sm font-bold uppercase ${rarityColors[achievement.rarity] || rarityColors.common}`}>
                {achievement.rarity}
              </span>
            </div>

            <h3 className="font-bold text-foreground uppercase tracking-wider mb-1">
              {achievement.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>

            {/* Unlock Date */}
            <div className="mt-3 text-xs text-muted-foreground">
              Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
            </div>

            {/* Category Badge */}
            <div className="mt-3">
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-sm font-bold uppercase">
                {achievement.achievement_type}
              </span>
            </div>
          </div>
        ))}

        {/* Locked Achievements Placeholder */}
        {achievements.length < totalAchievements && (
          <div className="coaching-card p-6 border-muted/50 opacity-40 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">More achievements coming soon!</p>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="coaching-card p-6 text-center neon-glow">
            <div className="text-3xl font-bold text-primary mb-1">{stats.total_achievements}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Total</div>
          </div>
          <div className="coaching-card p-6 text-center neon-glow">
            <div className="text-3xl font-bold text-blue-400 mb-1">{stats.rare_count}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Rare</div>
          </div>
          <div className="coaching-card p-6 text-center neon-glow">
            <div className="text-3xl font-bold text-purple-400 mb-1">{stats.epic_count}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Epic</div>
          </div>
          <div className="coaching-card p-6 text-center neon-glow">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.legendary_count}</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Legendary</div>
          </div>
        </div>
      )}
    </div>
  );
}
