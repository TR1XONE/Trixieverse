import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCoach } from '@/contexts/CoachContext';
import { Share2, X, Copy, Check } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  timestamp: Date;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  coachReaction: string;
  onClose: () => void;
}

export default function AchievementNotification({
  achievement,
  coachReaction,
  onClose,
}: AchievementNotificationProps) {
  const { t } = useLanguage();
  const { coachPersonality } = useCoach();
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-yellow-600',
  };

  const rarityBorders = {
    common: 'border-gray-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50',
  };

  const generateShareText = () => {
    return `🎉 I just unlocked "${achievement.name}" in TrixieVerse! 🏆\n\n"${coachReaction}"\n\n- ${coachPersonality.name} Coach\n\nJoin me in TrixieVerse and get your personal AI coach! 🚀\n\n#TrixieVerse #WildRift #Gaming #TR1XON`;
  };

  const shareText = generateShareText();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTikTok = () => {
    // In production, this would open TikTok share with pre-filled text
    const tiktokUrl = `https://www.tiktok.com/upload?text=${encodeURIComponent(shareText)}`;
    window.open(tiktokUrl, '_blank');
  };

  const handleShareInstagram = () => {
    // Instagram doesn't support direct text sharing, so we copy to clipboard
    handleCopyLink();
    alert('Copied to clipboard! Paste on Instagram 📸');
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto animate-in fade-in zoom-in duration-500">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 blur-3xl rounded-full" />

        {/* Card */}
        <div
          className={`relative bg-gradient-to-br ${rarityColors[achievement.rarity]} border-2 ${rarityBorders[achievement.rarity]} rounded-sm p-8 max-w-md w-96 shadow-2xl`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-sm transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Achievement icon */}
          <div className="text-6xl text-center mb-4 animate-bounce">{achievement.icon}</div>

          {/* Achievement name */}
          <h2 className="text-2xl font-bold text-white text-center uppercase tracking-wider mb-2">
            {achievement.name}
          </h2>

          {/* Achievement description */}
          <p className="text-white/90 text-center text-sm mb-6">{achievement.description}</p>

          {/* Coach reaction */}
          <div className="bg-black/30 rounded-sm p-4 mb-6 border border-white/20">
            <p className="text-white italic text-center">"{coachReaction}"</p>
            <p className="text-white/70 text-center text-xs mt-2 uppercase tracking-wider">
              — {coachPersonality.name} Coach
            </p>
          </div>

          {/* Share buttons */}
          <div className="space-y-3">
            {/* Share menu toggle */}
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-full bg-white text-black font-bold uppercase tracking-wider py-3 rounded-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 neon-glow"
            >
              <Share2 className="w-5 h-5" />
              {t('social.share')}
            </button>

            {/* Share options */}
            {showShareMenu && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                <button
                  onClick={handleShareTikTok}
                  className="bg-black text-white font-bold py-2 rounded-sm hover:bg-gray-800 transition-all text-sm uppercase tracking-wider"
                >
                  🎬 TikTok
                </button>
                <button
                  onClick={handleShareInstagram}
                  className="bg-pink-600 text-white font-bold py-2 rounded-sm hover:bg-pink-700 transition-all text-sm uppercase tracking-wider"
                >
                  📸 Instagram
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="bg-blue-500 text-white font-bold py-2 rounded-sm hover:bg-blue-600 transition-all text-sm uppercase tracking-wider"
                >
                  𝕏 Twitter
                </button>
                <button
                  onClick={handleCopyLink}
                  className="bg-cyan-500 text-white font-bold py-2 rounded-sm hover:bg-cyan-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-1"
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
            )}
          </div>

          {/* Rarity badge */}
          <div className="mt-6 text-center">
            <span className="inline-block px-4 py-2 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
              {achievement.rarity.toUpperCase()} ✨
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        onClick={onClose}
      />
    </div>
  );
}
