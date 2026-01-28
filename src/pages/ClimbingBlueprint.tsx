import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'wouter';
import axios from 'axios';
import { Trophy, Target, Zap, TrendingUp, AlertCircle, Loader } from 'lucide-react';

interface Champion {
  champion_id: number;
  champion_name: string;
  confidence: number;
  climb_probability: number;
  win_rate: number;
  sample_size: number;
  difficulty_level: number;
}

interface PowerSpike {
  early?: { time_minutes: number; power_level: number };
  mid?: { time_minutes: number; power_level: number };
  late?: { time_minutes: number; power_level: number };
}

interface Blueprint {
  player_id: string;
  current_tier: string;
  target_tier: string;
  main_role: string;
  recommended_champions: Champion[];
  estimated_climb_hours: number;
  climb_probability: number;
  confidence_score: number;
  generated_at: string;
  power_spike_windows: { [key: number]: PowerSpike };
}

const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

export default function ClimbingBlueprintPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [targetTier, setTargetTier] = useState<string>('PLATINUM');
  const [selectedRole, setSelectedRole] = useState<string>('MID');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleGenerateBlueprint = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/blueprint/generate', {
        targetTier,
        role: selectedRole,
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setBlueprint(response.data);
      }
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Failed to generate blueprint';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-400';
    if (difficulty <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-cyan-400" />
          <h1 className="text-4xl font-bold">Climbing Blueprint</h1>
        </div>
        <p className="text-gray-300">
          Get a personalized roadmap to reach your target rank with optimal champion picks and
          estimated climb time.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Your Goals
            </h2>

            {/* Current Tier Display */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Current Tier</label>
              <div className="bg-slate-800 px-4 py-3 rounded border border-cyan-500/20">
                <span className="font-mono text-lg text-cyan-400">{user?.tier || 'LOADING'}</span>
              </div>
            </div>

            {/* Target Tier Selector */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Target Tier</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value)}
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white
                         hover:border-cyan-400 focus:border-cyan-400 outline-none transition"
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier} className="bg-slate-800">
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm text-gray-300 mb-2">Main Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-white
                         hover:border-cyan-400 focus:border-cyan-400 outline-none transition"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateBlueprint}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500
                       disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                       text-white font-bold py-3 rounded transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Blueprint
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500 rounded p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {blueprint ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/50 rounded-lg p-6 backdrop-blur">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Success Probability</p>
                    <p className="text-3xl font-bold text-cyan-400">
                      {blueprint.climb_probability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Est. Time to Climb</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {blueprint.estimated_climb_hours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Confidence Score</p>
                    <p className="text-3xl font-bold text-green-400">
                      {blueprint.confidence_score}%
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-300">
                  Generated on {new Date(blueprint.generated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Recommended Champions */}
              <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-cyan-400" />
                  Recommended Champions
                </h3>

                <div className="space-y-3">
                  {blueprint.recommended_champions.map((champ, idx) => (
                    <div
                      key={champ.champion_id}
                      className="bg-slate-800/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-500/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg">
                            #{idx + 1} - {champ.champion_name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {champ.sample_size.toLocaleString()} matches analyzed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300">Difficulty</p>
                          <p className={`text-lg font-bold ${getDifficultyColor(champ.difficulty_level)}`}>
                            {champ.difficulty_level}/10
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-xs text-gray-400">Win Rate</p>
                          <p className="text-lg font-bold text-cyan-400">{champ.win_rate}%</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-xs text-gray-400">Confidence</p>
                          <p className="text-lg font-bold text-purple-400">
                            {(champ.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                          <p className="text-xs text-gray-400">Climb Prob</p>
                          <p className="text-lg font-bold text-green-400">
                            {(champ.climb_probability * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      {/* Power Spikes */}
                      {blueprint.power_spike_windows[champ.champion_id] && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Power Spikes
                          </p>
                          <div className="flex gap-2 text-xs">
                            {Object.entries(
                              blueprint.power_spike_windows[champ.champion_id] || {}
                            ).map(([phase, spike]: [string, any]) => (
                              <span
                                key={phase}
                                className="bg-slate-900/50 px-2 py-1 rounded text-gray-300"
                              >
                                {phase}: {spike.time_minutes}m
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-6 backdrop-blur">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Climbing Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Master 1-2 champions first - 70% of your focus
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Focus on power spikes for better decision-making
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Play 50+ games with each champion to optimize
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400">•</span>
                    Track your win rate - adjust if below 50%
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-12 backdrop-blur flex items-center justify-center h-96">
              <div className="text-center">
                <Target className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Generate a blueprint to see your personalized climbing roadmap
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
