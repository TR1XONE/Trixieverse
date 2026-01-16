import React, { useState } from 'react';
import { Users, Trophy } from 'lucide-react';
import FriendsSystem from '@/components/FriendsSystem';

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'circles' | 'tournaments'>('friends');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground uppercase tracking-widest">
            COMMUNITY
          </h1>
        </div>
        <p className="text-muted-foreground uppercase tracking-wider text-sm">
          Connect with other players and grow together
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b border-primary/30">
        {(['friends', 'circles', 'tournaments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
          >
            {tab === 'friends' ? '👥 Friends' : tab === 'circles' ? '🎯 Circles' : '🏆 Tournaments'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'friends' && <FriendsSystem />}
        
        {activeTab === 'circles' && (
          <div className="space-y-6">
            <div className="coaching-card p-8 text-center border-dashed border-primary/30">
              <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-4">
                Coaching Circles
              </h2>
              <p className="text-muted-foreground mb-6">
                Join a group of players with similar goals and learn together.
              </p>
              <button className="gaming-button px-8 py-3">
                Create New Circle
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="coaching-card p-6 neon-glow">
                <h3 className="text-xl font-bold text-primary uppercase tracking-wider mb-2">Mid Lane Masters</h3>
                <p className="text-sm text-muted-foreground mb-4">Focusing on roaming and wave management.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">12 Members</span>
                  <button className="text-xs font-bold text-primary uppercase hover:underline">Join Circle</button>
                </div>
              </div>
              <div className="coaching-card p-6 neon-glow">
                <h3 className="text-xl font-bold text-secondary uppercase tracking-wider mb-2">Jungle Pathing</h3>
                <p className="text-sm text-muted-foreground mb-4">Optimizing clear speeds and objective control.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">8 Members</span>
                  <button className="text-xs font-bold text-secondary uppercase hover:underline">Join Circle</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="text-center p-12 coaching-card border-dashed border-primary/30">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-2">
              Tournaments
            </h2>
            <p className="text-muted-foreground">
              Competitive events coming soon! Stay tuned for the first TrixieVerse Open.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
