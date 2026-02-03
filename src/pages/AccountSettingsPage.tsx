import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCoach } from '@/contexts/CoachContext';
import AccountConnector from '@/components/AccountConnector';
import { Settings, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountSettingsPage() {
  const { t } = useLanguage();
  const { userProfile, updateUserProfile } = useCoach();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshStats = async () => {
    if (!userProfile?.id) return;

    setRefreshing(true);
    try {
      const response = await fetch(`/api/account/${userProfile.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        updateUserProfile({
          ...userProfile,
          currentRank: data.player.rank,
          opggData: data.player,
        });
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    updateUserProfile({
      ...userProfile,
      opggConnected: false,
      opggData: null,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold text-foreground uppercase tracking-wider">
            Account Settings
          </h1>
          <Settings className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-foreground text-lg">
          Manage your Wild Rift account connection
        </p>
      </div>

      {/* Connected Account Info */}
      {userProfile?.opggConnected && userProfile?.opggData ? (
        <div className="coaching-card p-6 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-2 border-green-500/30 neon-glow">
          <h3 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-wider">
            ✅ Connected Account
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Player Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Player Name
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userProfile.opggData.name}#{userProfile.opggData.tag}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Current Rank
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {userProfile.opggData.rank}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Level
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userProfile.opggData.level}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Win Rate
                </p>
                <p className="text-2xl font-bold text-cyan-400">
                  {userProfile.opggData.winRate}%
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Matches
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userProfile.opggData.matchCount}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Main Champions
                </p>
                <p className="text-lg font-bold text-foreground">
                  {userProfile.opggData.champions
                    .slice(0, 3)
                    .map((c: any) => c.name)
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleRefreshStats}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Disconnect
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 rounded-sm bg-muted/20 border border-muted/30">
            <p className="text-xs text-muted-foreground">
              💡 Your stats are automatically synced from op.gg. CoachOS uses this data to track your progress and provide personalized coaching!
            </p>
          </div>
        </div>
      ) : (
        <AccountConnector onConnected={handleRefreshStats} />
      )}

      {/* Additional Settings */}
      <div className="coaching-card p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 neon-glow">
        <h3 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-wider">
          ⚙️ Additional Settings
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-sm bg-muted/20 border border-muted/30">
            <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">
              Auto-Update Stats
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically refresh your stats from op.gg every hour
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <span className="text-foreground font-bold">Enabled</span>
            </label>
          </div>

          <div className="p-4 rounded-sm bg-muted/20 border border-muted/30">
            <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">
              Notifications
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get notified when you rank up or reach milestones
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <span className="text-foreground font-bold">Enabled</span>
            </label>
          </div>

          <div className="p-4 rounded-sm bg-muted/20 border border-muted/30">
            <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">
              Data Privacy
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Your data is private and only used for coaching purposes
            </p>
            <p className="text-xs text-muted-foreground">
              ✅ Your account data is encrypted and never shared
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="coaching-card p-6 border-l-4 border-primary">
        <h3 className="text-2xl font-bold text-foreground mb-6 uppercase tracking-wider">
          ❓ FAQ
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">How often are my stats updated?</h4>
            <p className="text-sm text-muted-foreground">
              Your stats are cached for 5 minutes and refreshed on demand. You can manually refresh anytime.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-2">Is my account data safe?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! We only fetch public data from op.gg. Your password is never stored or shared.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-2">Can I connect multiple accounts?</h4>
            <p className="text-sm text-muted-foreground">
              Currently, you can connect one main account. Multiple account support is coming soon!
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-2">What data does CoachOS use?</h4>
            <p className="text-sm text-muted-foreground">
              CoachOS uses your rank, win rate, champion pool, and recent match history to provide personalized coaching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
