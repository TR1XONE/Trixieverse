import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AnalyticsDashboardPage() {
  const { t } = useLanguage();
  const [skillProfile, setSkillProfile] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch skill profile
      const profileRes = await fetch('/api/analytics/skill-profile?playerAccountId=default');
      const profile = await profileRes.json();
      setSkillProfile(profile);

      // Fetch trends
      const trendsRes = await fetch('/api/analytics/trends?playerAccountId=default&days=30');
      const trendsData = await trendsRes.json();
      setTrends(trendsData);

      // Fetch recommendations
      const recsRes = await fetch('/api/analytics/recommendations?playerAccountId=default');
      const recsData = await recsRes.json();
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading analytics...</div>
      </div>
    );
  }

  const radarData = skillProfile ? [
    { name: 'Mechanics', value: skillProfile.mechanicsScore },
    { name: 'Macro', value: skillProfile.macroPlayScore },
    { name: 'Decision', value: skillProfile.decisionMakingScore },
    { name: 'Consistency', value: skillProfile.consistencyScore },
    { name: 'Clutch', value: skillProfile.clutchFactorScore },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 scanlines">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 uppercase tracking-widest mb-2">
            📊 ANALYTICS DASHBOARD
          </h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Your detailed performance analysis
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="coaching-card p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 neon-glow">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Overall Rating</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {skillProfile?.overallRating.toFixed(0)}/100
                </p>
              </div>
            </div>
          </div>

          <div className="coaching-card p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 neon-glow">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Trend</p>
                <p className="text-2xl font-bold text-purple-400 uppercase">
                  {skillProfile?.trend || 'stable'}
                </p>
              </div>
            </div>
          </div>

          <div className="coaching-card p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 neon-glow">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Matches</p>
                <p className="text-2xl font-bold text-green-400">
                  {skillProfile?.matchesAnalyzed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="coaching-card p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 neon-glow">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-xs text-muted-foreground uppercase">Best Skill</p>
                <p className="text-2xl font-bold text-orange-400">
                  {skillProfile?.mechanicsScore > skillProfile?.macroPlayScore ? 'Mechanics' : 'Macro'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Radar */}
          <div className="coaching-card p-6 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow">
            <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-4">
              SKILL RADAR
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#00d4ff30" />
                <PolarAngleAxis dataKey="name" stroke="#00d4ff" />
                <PolarRadiusAxis stroke="#00d4ff" />
                <Radar name="Score" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trend */}
          <div className="coaching-card p-6 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow">
            <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-4">
              PERFORMANCE TREND
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid stroke="#00d4ff30" />
                <XAxis dataKey="date" stroke="#00d4ff" />
                <YAxis stroke="#00d4ff" />
                <Tooltip contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #00d4ff' }} />
                <Legend />
                <Line type="monotone" dataKey="avg_performance" stroke="#00d4ff" strokeWidth={2} />
                <Line type="monotone" dataKey="win_rate" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="coaching-card p-6 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow">
          <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-4">
            💡 PERSONALIZED RECOMMENDATIONS
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-sm bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-cyan-400">
                  {idx + 1}
                </div>
                <p className="text-sm text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
