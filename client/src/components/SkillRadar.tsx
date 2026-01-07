import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SkillRadarProps {
  mechanics: number;
  macroPlay: number;
  decisionMaking: number;
  consistency: number;
  clutchFactor: number;
  trend: 'improving' | 'stable' | 'declining';
}

export default function SkillRadar({
  mechanics,
  macroPlay,
  decisionMaking,
  consistency,
  clutchFactor,
  trend,
}: SkillRadarProps) {
  const { t } = useLanguage();
  const [animatedValues, setAnimatedValues] = useState({
    mechanics: 0,
    macroPlay: 0,
    decisionMaking: 0,
    consistency: 0,
    clutchFactor: 0,
  });

  // Animate values on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues((prev) => ({
        mechanics: Math.min(prev.mechanics + 2, mechanics),
        macroPlay: Math.min(prev.macroPlay + 2, macroPlay),
        decisionMaking: Math.min(prev.decisionMaking + 2, decisionMaking),
        consistency: Math.min(prev.consistency + 2, consistency),
        clutchFactor: Math.min(prev.clutchFactor + 2, clutchFactor),
      }));
    }, 30);

    return () => clearInterval(interval);
  }, [mechanics, macroPlay, decisionMaking, consistency, clutchFactor]);

  const overallRating = Math.round(
    (mechanics + macroPlay + decisionMaking + consistency + clutchFactor) / 5
  );

  const trendColors = {
    improving: 'text-green-400',
    stable: 'text-cyan-400',
    declining: 'text-red-400',
  };

  const trendEmoji = {
    improving: '📈',
    stable: '→',
    declining: '📉',
  };

  const skills = [
    { name: 'Mechanics', value: animatedValues.mechanics, icon: '⚡' },
    { name: 'Macro Play', value: animatedValues.macroPlay, icon: '🗺️' },
    { name: 'Decision Making', value: animatedValues.decisionMaking, icon: '🧠' },
    { name: 'Consistency', value: animatedValues.consistency, icon: '📊' },
    { name: 'Clutch Factor', value: animatedValues.clutchFactor, icon: '🔥' },
  ];

  // Calculate radar points for SVG
  const center = 150;
  const radius = 120;
  const angleSlice = (Math.PI * 2) / skills.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = animatedValues
    ? Object.values(animatedValues).map((value, index) => getPoint(index, value))
    : [];

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="coaching-card p-6 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border-2 border-cyan-500/30 neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground uppercase tracking-wider">Skill Radar</h3>
          <p className="text-sm text-muted-foreground mt-1">Your playstyle profile</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-cyan-400">{overallRating}</p>
          <p className={`text-sm font-bold uppercase tracking-wider ${trendColors[trend]}`}>
            {trendEmoji[trend]} {trend}
          </p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center mb-8">
        <svg width="300" height="300" className="drop-shadow-lg">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((percent) => (
            <circle
              key={percent}
              cx={center}
              cy={center}
              r={(percent / 100) * radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/20"
              strokeDasharray="4,4"
            />
          ))}

          {/* Axis lines */}
          {skills.map((_, index) => {
            const point = getPoint(index, 100);
            return (
              <line
                key={`axis-${index}`}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary/30"
              />
            );
          })}

          {/* Skill polygon */}
          {polygonPoints && (
            <>
              <polygon
                points={polygonPoints}
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="2"
                className="text-cyan-400 animate-pulse"
              />
            </>
          )}

          {/* Skill labels */}
          {skills.map((skill, index) => {
            const labelPoint = getPoint(index, 130);
            return (
              <text
                key={`label-${index}`}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-foreground"
              >
                {skill.icon}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Skill breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.name} className="bg-muted/20 rounded-sm p-4 border border-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-foreground uppercase tracking-wider text-sm">
                {skill.icon} {skill.name}
              </p>
              <span className="text-lg font-bold text-cyan-400">{Math.round(skill.value)}</span>
            </div>
            <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 rounded-sm bg-muted/20 border border-muted/30">
        <p className="text-xs text-muted-foreground">
          💡 Your skill radar updates after every match. Focus on improving your weakest areas to boost your overall rating!
        </p>
      </div>
    </div>
  );
}
