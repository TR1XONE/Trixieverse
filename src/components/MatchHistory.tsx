import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

interface Match {
  id: string;
  champion_name: string;
  role: string;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  assists: number;
  damage_dealt: number;
  gold_earned: number;
  cs: number;
  duration_seconds: number;
  match_timestamp: string;
}

interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  winRate: number;
  currentWinStreak: number;
  currentLossStreak: number;
  longestWinStreak: number;
  lastMatchDeaths: number;
  lastMatchKills: number;
  lastMatchDamage: number;
  bestChampionWinRate: number;
  bestChampionMatches: number;
  averageKDA: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
}

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setError('Not authenticated');
          return;
        }

        // Fetch match history
        const matchesRes = await axios.get('/api/matches/history?limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch stats
        const statsRes = await axios.get('/api/matches/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMatches(matchesRes.data.data || []);
        setStats(statsRes.data.data || null);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching match data:', err);
        setError(err.response?.data?.message || 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatKDA = (kills: number, deaths: number, assists: number) => {
    return `${kills}/${deaths}/${assists}`;
  };

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2 uppercase tracking-wider">
          📊 Match History
        </h2>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="coaching-card p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Win Rate</div>
                <div className="text-3xl font-bold text-primary">{stats.winRate}%</div>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats.totalWins}W - {stats.totalLosses}L
            </div>
          </div>

          <div className="coaching-card p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Current Streak</div>
                <div className="text-3xl font-bold text-secondary">
                  {stats.currentWinStreak > 0 ? `+${stats.currentWinStreak}` : `-${stats.currentLossStreak}`}
                </div>
              </div>
              <TrendingUp className={`w-8 h-8 ${stats.currentWinStreak > 0 ? 'text-secondary' : 'text-red-400'} opacity-50`} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Best: {stats.longestWinStreak}
            </div>
          </div>

          <div className="coaching-card p-6 neon-glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Average KDA</div>
                <div className="text-3xl font-bold text-accent">{stats.averageKDA.toFixed(2)}</div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <div>{stats.totalKills} Kills</div>
                <div>{stats.totalDeaths} Deaths</div>
                <div>{stats.totalAssists} Assists</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match History Table */}
      <div className="coaching-card p-6 neon-glow overflow-x-auto">
        <h3 className="text-lg font-bold text-primary uppercase tracking-wider mb-4">Recent Matches</h3>
        
        {matches.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No matches recorded yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="text-left py-2 px-2 text-muted-foreground">Result</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Champion</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Role</th>
                <th className="text-left py-2 px-2 text-muted-foreground">KDA</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Damage</th>
                <th className="text-left py-2 px-2 text-muted-foreground">CS</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Duration</th>
                <th className="text-left py-2 px-2 text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-sm font-bold text-xs uppercase ${
                      match.result === 'win' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {match.result === 'win' ? 'W' : 'L'}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-bold text-foreground">{match.champion_name}</td>
                  <td className="py-3 px-2 text-muted-foreground uppercase text-xs">{match.role}</td>
                  <td className="py-3 px-2 text-foreground">
                    {formatKDA(match.kills, match.deaths, match.assists)}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {(match.damage_dealt / 1000).toFixed(1)}k
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{match.cs}</td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {formatDuration(match.duration_seconds)}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">
                    {new Date(match.match_timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
