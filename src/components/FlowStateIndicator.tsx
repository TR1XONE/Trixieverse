import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Heart } from 'lucide-react';

interface FlowStateIndicatorProps {
  flowScore: number;
  isInFlow: boolean;
  winStreak: number;
  consecutiveGoodDecisions: number;
  confidence: number;
  focusLevel: number;
  timeInFlow: number;
}

export default function FlowStateIndicator({
  flowScore,
  isInFlow,
  winStreak,
  consecutiveGoodDecisions,
  confidence,
  focusLevel,
  timeInFlow,
}: FlowStateIndicatorProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Pulse effect when in flow
  useEffect(() => {
    if (!isInFlow) return;

    const interval = setInterval(() => {
      setPulseIntensity((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, [isInFlow]);

  const flowColors = {
    low: 'from-gray-500 to-gray-600',
    medium: 'from-yellow-500 to-orange-500',
    high: 'from-green-500 to-emerald-500',
    peak: 'from-purple-500 to-pink-500',
  };

  const getFlowLevel = () => {
    if (flowScore < 30) return 'low';
    if (flowScore < 60) return 'medium';
    if (flowScore < 85) return 'high';
    return 'peak';
  };

  const flowLevel = getFlowLevel();
  const flowTexts = {
    low: 'Warming Up',
    medium: 'Getting Started',
    high: 'In The Zone',
    peak: 'PEAK FLOW STATE 🔥',
  };

  const pulseClass = isInFlow
    ? pulseIntensity === 0
      ? 'animate-pulse'
      : pulseIntensity === 1
        ? 'animate-bounce'
        : 'opacity-100'
    : '';

  return (
    <div
      className={`coaching-card p-6 bg-gradient-to-br ${flowColors[flowLevel]} border-2 border-white/30 neon-glow ${pulseClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className={`w-8 h-8 ${isInFlow ? 'text-white animate-spin' : 'text-white/50'}`} />
          <div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Flow State</h3>
            <p className="text-sm text-white/80">{flowTexts[flowLevel]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white">{Math.round(flowScore)}</p>
          <p className="text-xs text-white/70 uppercase tracking-wider">Flow Score</p>
        </div>
      </div>

      {/* Flow indicator bar */}
      <div className="mb-6">
        <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden border border-white/30">
          <div
            className={`h-full bg-gradient-to-r from-white to-white/50 transition-all duration-300 ${
              isInFlow ? 'shadow-lg shadow-white/50' : ''
            }`}
            style={{ width: `${flowScore}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/70 mt-2">
          <span>Warming Up</span>
          <span>Peak Flow</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/10 rounded-sm p-3 border border-white/20">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Win Streak</p>
          <p className="text-2xl font-bold text-white">{winStreak}</p>
        </div>
        <div className="bg-white/10 rounded-sm p-3 border border-white/20">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Good Decisions</p>
          <p className="text-2xl font-bold text-white">{consecutiveGoodDecisions}</p>
        </div>
        <div className="bg-white/10 rounded-sm p-3 border border-white/20">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Confidence</p>
          <p className="text-2xl font-bold text-white">{Math.round(confidence)}</p>
        </div>
        <div className="bg-white/10 rounded-sm p-3 border border-white/20">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Focus</p>
          <p className="text-2xl font-bold text-white">{Math.round(focusLevel)}</p>
        </div>
      </div>

      {/* Time in flow */}
      <div className="bg-white/10 rounded-sm p-4 border border-white/20 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-white" />
          <p className="font-bold text-white uppercase tracking-wider">Time In Flow</p>
        </div>
        <p className="text-3xl font-bold text-white">{timeInFlow} min</p>
        <p className="text-xs text-white/70 mt-1">Keep this energy going!</p>
      </div>

      {/* Flow state message */}
      {isInFlow && (
        <div className="bg-white/20 rounded-sm p-4 border-2 border-white/50 text-center">
          <p className="text-white font-bold uppercase tracking-wider mb-2">🔥 YOU'RE IN THE ZONE! 🔥</p>
          <p className="text-sm text-white/90">
            Your decisions are sharp, your confidence is high, and your focus is locked in. This is where legends are made!
          </p>
        </div>
      )}

      {!isInFlow && flowScore > 50 && (
        <div className="bg-white/10 rounded-sm p-4 border border-white/30 text-center">
          <p className="text-white font-bold uppercase tracking-wider mb-2">Getting Close!</p>
          <p className="text-sm text-white/80">
            You're warming up nicely. Keep making good decisions and you'll enter the zone soon!
          </p>
        </div>
      )}

      {flowScore < 30 && (
        <div className="bg-white/10 rounded-sm p-4 border border-white/30 text-center">
          <p className="text-white font-bold uppercase tracking-wider mb-2">Warming Up</p>
          <p className="text-sm text-white/80">Focus on making good decisions. The zone is within reach!</p>
        </div>
      )}
    </div>
  );
}
