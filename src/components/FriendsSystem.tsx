import React, { useState } from 'react';
import { UserPlus, Users, MessageCircle, Play } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  rank: string;
  mainRole: string;
  winRate: number;
  lastActive: Date;
  status: 'online' | 'offline' | 'in-game';
}

export default function FriendsSystem() {
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'ProGamer',
      rank: 'Gold',
      mainRole: 'Mid',
      winRate: 58,
      lastActive: new Date(),
      status: 'in-game',
    },
    {
      id: '2',
      name: 'SilentAssassin',
      rank: 'Silver',
      mainRole: 'Jungle',
      winRate: 52,
      lastActive: new Date(Date.now() - 30 * 60000),
      status: 'online',
    },
    {
      id: '3',
      name: 'WildRiftKing',
      rank: 'Platinum',
      mainRole: 'Solo',
      winRate: 61,
      lastActive: new Date(Date.now() - 2 * 3600000),
      status: 'offline',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Friends ({friends.length})
        </h2>
        <button className="gaming-button px-4 py-2 text-sm">
          <UserPlus className="w-4 h-4 mr-2 inline" />
          Add Friend
        </button>
      </div>

      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="coaching-card p-4 neon-glow hover:border-primary/80 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-muted/50 rounded-sm flex items-center justify-center border border-primary/30">
                    <span className="text-xl font-bold text-primary">{friend.name[0]}</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    friend.status === 'online' ? 'bg-green-500' : 
                    friend.status === 'in-game' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground uppercase tracking-wider">
                      {friend.name}
                    </h3>
                    {friend.status === 'in-game' && (
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-sm font-bold animate-pulse">
                        IN GAME
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{friend.rank} • {friend.mainRole}</span>
                    <span className="text-secondary font-bold">{friend.winRate}% WR</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-sm bg-muted/30 text-foreground hover:bg-primary/20 hover:text-primary transition-all">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="coaching-card p-4 bg-primary/5 border-dashed border-primary/30 text-center">
        <p className="text-sm text-muted-foreground italic">
          "Playing with friends increases your win rate by 15%!"
        </p>
        <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">
          — Sage Coach Tip
        </p>
      </div>
    </div>
  );
}
