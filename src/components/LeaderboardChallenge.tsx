import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Share2, Trophy, Zap, Copy, Check } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  champion: string;
  winRate: number;
  timestamp: Date;
}

interface LeaderboardChallengeProps {
  title: string;
  entries: LeaderboardEntry[];
  currentPlayerRank: number;
  currentPlayerScore: number;
}

export default function LeaderboardChallenge({
  title,
  entries,
  currentPlayerRank,
  currentPlayerScore,
}: LeaderboardChallengeProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const generateChallengeLink = () => {
    return `https://trixieverse.gg/challenge/${currentPlayerRank}?score=${currentPlayerScore}`;
  };

  const generateShareText = () => {
    const lang = language === 'sv' ? 'SV' : 'EN';
    return `🏆 I'm #${currentPlayerRank} on the TrixieVerse Leaderboard! Can you beat my score of ${currentPlayerScore}? 🎮\n\n${t('social.beatMyScore')}: ${generateChallengeLink()}\n\n#TrixieVerse #WildRift #Gaming #TR1XON`;
  };

  const handleCopyChallenge = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTikTok = () => {
    const tiktokUrl = `https://www.tiktok.com/upload?text=${encodeURIComponent(generateShareText())}`;
    window.open(tiktokUrl, '_blank');
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText())}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="coaching-card p-6 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border-2 border-yellow-500/30 neon-glow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
          <h3 className="text-2xl font-bold text-foreground uppercase tracking-wider">{title}</h3>
        </div>
      </div>

      {/* Current player position */}
      <div className="mb-6 p-4 rounded-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Your Position</p>
            <p className="text-3xl font-bold text-yellow-400">#{currentPlayerRank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Your Score</p>
            <p className="text-3xl font-bold text-yellow-400">{currentPlayerScore}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard preview */}
      <div className="mb-6 space-y-2">
        <p className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Top Players</p>
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between p-3 rounded-sm ${
              entry.rank === currentPlayerRank
                ? 'bg-yellow-500/30 border border-yellow-500/50'
                : 'bg-muted/20 border border-muted/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-yellow-400 w-8 text-center">#{entry.rank}</span>
              <div>
                <p className="font-bold text-foreground">{entry.playerName}</p>
                <p className="text-xs text-muted-foreground">{entry.champion} • {entry.winRate}% WR</p>
              </div>
            </div>
            <span className="text-lg font-bold text-yellow-400">{entry.score}</span>
          </div>
        ))}
      </div>

      {/* Challenge buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleShareTikTok}
          className="bg-black text-white font-bold py-3 rounded-sm hover:bg-gray-800 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          TikTok
        </button>
        <button
          onClick={handleShareTwitter}
          className="bg-blue-500 text-white font-bold py-3 rounded-sm hover:bg-blue-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Twitter
        </button>
        <button
          onClick={handleCopyChallenge}
          className="bg-cyan-500 text-white font-bold py-3 rounded-sm hover:bg-cyan-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Challenge info */}
      <div className="mt-6 p-4 rounded-sm bg-muted/20 border border-muted/30">
        <p className="text-xs text-muted-foreground">
          💡 Share your challenge and let your friends try to beat your score! The more you share, the more people will join TrixieVerse.
        </p>
      </div>
    </div>
  );
}
