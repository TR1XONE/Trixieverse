import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCoach } from '@/contexts/CoachContext';
import SkillRadar from '@/components/SkillRadar';
import FlowStateIndicator from '@/components/FlowStateIndicator';
import MemoryMomentsDisplay from '@/components/MemoryMomentsDisplay';
import CoachOS, { CoachOSState, MemoryMoment } from '@/systems/CoachOS';
import { Sparkles } from 'lucide-react';

export default function CoachOSPage() {
  const { t } = useLanguage();
  const { userProfile, coachPersonality } = useCoach();
  const [coachOS, setCoachOS] = useState<CoachOS | null>(null);
  const [state, setState] = useState<CoachOSState | null>(null);

  useEffect(() => {
    // Initialize CoachOS
    const os = new CoachOS(userProfile?.id || 'player_default');
    os.loadFromLocalStorage();

    // Add some demo memory moments if none exist
    if (os.getState().memoryMoments.length === 0) {
      os.recordMemoryMoment({
        type: 'epic_play',
        description: 'Pulled off an incredible 1v3 teamfight',
        context: {
          champion: 'Ahri',
          role: 'mid',
          enemy: 'Zed',
          kda: '3/0/2',
          gold: 4500,
        },
        emotionalWeight: 95,
        coachReaction: 'That was absolutely legendary! Your positioning was perfect!',
      });

      os.recordMemoryMoment({
        type: 'clutch_moment',
        description: 'Won the game with a last-second skill shot',
        context: {
          champion: 'Ahri',
          role: 'mid',
          enemy: 'Zed',
          kda: '5/2/8',
        },
        emotionalWeight: 90,
        coachReaction: 'CLUTCH! That\'s the kind of moment that defines a player!',
      });

      os.recordMemoryMoment({
        type: 'learning_moment',
        description: 'Learned the importance of warding baron pit',
        context: {
          champion: 'Ahri',
          role: 'mid',
          enemy: 'Zed',
        },
        emotionalWeight: 60,
        coachReaction: 'Good learning moment. Vision control wins games!',
      });
    }

    // Update skill profile with demo data
    os.updateSkillProfile({
      mechanics: 72,
      macroPlay: 65,
      decisionMaking: 78,
      clutchFactor: 85,
      result: 'win',
    });

    // Update flow state
    os.updateFlowState({
      consecutiveWins: 3,
      decisionQuality: 82,
      confidence: 88,
      focusLevel: 85,
    });

    os.calculateRelationshipScore();
    os.saveToLocalStorage();

    setCoachOS(os);
    setState(os.getState());
  }, [userProfile?.id]);

  if (!state || !coachOS) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground text-lg">{t('common.loading')}</p>
      </div>
    );
  }

  const skillProfile = state.skillProfile;
  const flowState = state.flowState;
  const personalityEvolution = state.personalityEvolution;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold text-foreground uppercase tracking-wider">
            CoachOS
          </h1>
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-foreground text-lg">
          The Living Coach System - Your coach evolves with you
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{state.relationshipScore}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Relationship Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary">{personalityEvolution.stage}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Coach Stage</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">{state.totalMatchesAnalyzed}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Matches Analyzed</p>
          </div>
        </div>
      </div>

      {/* Flow State Indicator */}
      <FlowStateIndicator
        flowScore={flowState.flowScore}
        isInFlow={flowState.isInFlow}
        winStreak={flowState.winStreak}
        consecutiveGoodDecisions={flowState.consecutiveGoodDecisions}
        confidence={flowState.confidence}
        focusLevel={flowState.focusLevel}
        timeInFlow={flowState.timeInFlow}
      />

      {/* Skill Radar */}
      <SkillRadar
        mechanics={skillProfile.mechanics}
        macroPlay={skillProfile.macroPlay}
        decisionMaking={skillProfile.decisionMaking}
        consistency={skillProfile.consistency}
        clutchFactor={skillProfile.clutchFactor}
        trend={skillProfile.trend}
      />

      {/* Memory Moments */}
      <MemoryMomentsDisplay
        moments={state.memoryMoments}
        coachName={coachPersonality.name}
      />

      {/* Personality Evolution Info */}
      <div className="coaching-card p-6 bg-gradient-to-br from-orange-600/10 to-yellow-600/10 border-2 border-orange-500/30 neon-glow">
        <h3 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-wider">
          Coach Evolution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stage progression */}
          <div>
            <p className="font-bold text-foreground uppercase tracking-wider mb-4">Relationship Stage</p>
            <div className="space-y-2">
              {['stranger', 'acquaintance', 'friend', 'best_friend', 'legend'].map((stage) => (
                <div
                  key={stage}
                  className={`p-3 rounded-sm transition-all ${
                    personalityEvolution.stage === stage
                      ? 'bg-orange-500/30 border border-orange-500/50'
                      : 'bg-muted/20 border border-muted/30'
                  }`}
                >
                  <p className="font-bold text-foreground capitalize">{stage}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage === 'stranger' && 'Just getting to know each other'}
                    {stage === 'acquaintance' && 'Starting to understand your style'}
                    {stage === 'friend' && 'Building a real connection'}
                    {stage === 'best_friend' && 'Deep understanding and trust'}
                    {stage === 'legend' && 'Unbreakable bond - you\'re a legend!'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <p className="font-bold text-foreground uppercase tracking-wider mb-4">Coach Stats</p>
            <div className="space-y-3">
              <div className="bg-muted/20 rounded-sm p-3 border border-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Interactions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {personalityEvolution.interactionCount}
                </p>
              </div>
              <div className="bg-muted/20 rounded-sm p-3 border border-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Trust Level
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                      style={{ width: `${personalityEvolution.trustLevel}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round(personalityEvolution.trustLevel)}%
                  </span>
                </div>
              </div>
              <div className="bg-muted/20 rounded-sm p-3 border border-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Personal Jokes
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {personalityEvolution.personalJokes.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal jokes */}
        {personalityEvolution.personalJokes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-muted/30">
            <p className="font-bold text-foreground uppercase tracking-wider mb-3">
              Coach's Inside Jokes
            </p>
            <div className="space-y-2">
              {personalityEvolution.personalJokes.map((joke, index) => (
                <div key={index} className="bg-white/10 rounded-sm p-3 border border-white/20">
                  <p className="text-foreground italic">"{joke}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="coaching-card p-6 border-l-4 border-primary">
        <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider">
          💜 What is CoachOS?
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            ✨ <strong>Memory Moments:</strong> Your coach remembers your best and worst moments
          </li>
          <li>
            🎮 <strong>Live Commentary:</strong> Real-time reactions during your matches
          </li>
          <li>
            💫 <strong>Personality Evolution:</strong> Your coach becomes more personal over time
          </li>
          <li>
            🎯 <strong>Skill Radar:</strong> Visual representation of your playstyle profile
          </li>
          <li>
            🌊 <strong>Flow State Detection:</strong> Know when you're in "the zone"
          </li>
          <li>
            🤝 <strong>Living Relationship:</strong> Your coach isn't just a tool - it's your friend
          </li>
        </ul>
      </div>
    </div>
  );
}
