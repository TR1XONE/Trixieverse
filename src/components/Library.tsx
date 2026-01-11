import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp } from 'lucide-react';

interface Champion {
  name: string;
  winRate: number;
  pickRate: number;
  tier: 'S+' | 'S' | 'A' | 'B' | 'C';
}

const TIER_DATA: Record<string, Champion[]> = {
  solo: [
    { name: 'Tryndamere', winRate: 54.2, pickRate: 12.5, tier: 'S+' },
    { name: 'Garen', winRate: 52.8, pickRate: 10.2, tier: 'S' },
    { name: 'Darius', winRate: 51.5, pickRate: 8.9, tier: 'S' },
    { name: 'Fiora', winRate: 50.2, pickRate: 7.3, tier: 'A' },
    { name: 'Olaf', winRate: 49.8, pickRate: 6.5, tier: 'A' },
  ],
  jungle: [
    { name: 'Lee Sin', winRate: 53.1, pickRate: 15.8, tier: 'S+' },
    { name: 'Evelynn', winRate: 52.4, pickRate: 12.3, tier: 'S' },
    { name: 'Kha\'Zix', winRate: 51.9, pickRate: 11.2, tier: 'S' },
    { name: 'Graves', winRate: 50.5, pickRate: 9.8, tier: 'A' },
    { name: 'Nidalee', winRate: 49.2, pickRate: 8.1, tier: 'A' },
  ],
  mid: [
    { name: 'Lux', winRate: 53.8, pickRate: 14.2, tier: 'S+' },
    { name: 'Ahri', winRate: 52.6, pickRate: 13.5, tier: 'S' },
    { name: 'Akali', winRate: 51.3, pickRate: 10.9, tier: 'S' },
    { name: 'Yasuo', winRate: 50.1, pickRate: 9.4, tier: 'A' },
    { name: 'Zed', winRate: 49.7, pickRate: 8.6, tier: 'A' },
  ],
  duo: [
    { name: 'Caitlyn', winRate: 54.5, pickRate: 16.2, tier: 'S+' },
    { name: 'Jinx', winRate: 53.2, pickRate: 14.8, tier: 'S' },
    { name: 'Ashe', winRate: 51.8, pickRate: 11.5, tier: 'S' },
    { name: 'Draven', winRate: 50.4, pickRate: 9.2, tier: 'A' },
    { name: 'Vayne', winRate: 49.6, pickRate: 7.8, tier: 'A' },
  ],
  support: [
    { name: 'Thresh', winRate: 54.1, pickRate: 15.9, tier: 'S+' },
    { name: 'Leona', winRate: 52.9, pickRate: 13.4, tier: 'S' },
    { name: 'Blitzcrank', winRate: 51.6, pickRate: 10.7, tier: 'S' },
    { name: 'Lulu', winRate: 50.3, pickRate: 8.9, tier: 'A' },
    { name: 'Alistar', winRate: 49.8, pickRate: 7.6, tier: 'A' },
  ],
};

const getTierColor = (tier: string) => {
  const colors: Record<string, string> = {
    'S+': 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-lg shadow-yellow-500/50',
    'S': 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/50',
    'A': 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50',
    'B': 'bg-gradient-to-r from-cyan-400 to-teal-500 text-white shadow-lg shadow-cyan-500/50',
    'C': 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/50',
  };
  return colors[tier] || 'bg-gray-300';
};

function ChampionCard({ champion }: { champion: Champion }) {
  return (
    <div className="coaching-card p-6 neon-glow hover:border-primary/80 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-foreground text-lg uppercase tracking-wider group-hover:text-primary transition-colors">{champion.name}</h4>
          <div className={`inline-block mt-2 px-3 py-1 rounded-sm text-sm font-bold border-2 border-current ${getTierColor(champion.tier)}`}>
            Tier {champion.tier}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Win Rate</p>
          <p className="text-2xl font-bold text-primary">{champion.winRate}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Pick Rate</p>
          <p className="text-2xl font-bold text-secondary">{champion.pickRate}%</p>
        </div>
      </div>
    </div>
  );
}

export default function Library() {
  const roles = ['solo', 'jungle', 'mid', 'duo', 'support'] as const;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 flex items-center justify-center gap-3 uppercase tracking-wider">
          <BookOpen className="w-10 h-10 text-primary" />
          The Library
        </h1>
        <p className="text-lg text-foreground max-w-2xl mx-auto">
          Meta tier lists, champion guides, and strategic insights. Updated regularly.
        </p>
      </div>

      <div className="coaching-card p-6 bg-gradient-to-r from-accent/20 to-secondary/20 border-l-4 border-accent neon-glow">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-accent flex-shrink-0 mt-1 animate-pulse" />
          <div>
            <h3 className="font-bold text-foreground mb-1 uppercase tracking-wider">Meta Updated: Patch 6.3f</h3>
            <p className="text-sm text-muted-foreground">
              Based on Master+ rank statistics. Win rates and pick rates reflect the current competitive meta.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="solo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 rounded-sm p-1 bg-muted/30 border-2 border-primary/30">
          {roles.map((role) => (
            <TabsTrigger
              key={role}
              value={role}
              className="capitalize rounded-sm font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/50 transition-all duration-200"
            >
              {role === 'duo' ? 'ADC' : role === 'solo' ? 'Baron' : role}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role} value={role} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TIER_DATA[role].map((champion) => (
                <ChampionCard key={champion.name} champion={champion} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="coaching-card p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 neon-glow">
        <h3 className="text-xl font-bold text-foreground mb-4 uppercase tracking-wider">💡 How to Use This Library</h3>
        <ul className="space-y-3 text-foreground">
          <li className="flex gap-3">
            <span className="text-primary font-bold text-lg">▸</span>
            <span>Check the tier list for your main role to see which champions are currently strong.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold text-lg">▸</span>
            <span>Use S+ and S tier champions to climb faster—they have the highest win rates.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold text-lg">▸</span>
            <span>Master 2-3 champions in your role instead of playing everything. Consistency wins games.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold text-lg">▸</span>
            <span>Combine this with the War Room for personalized counter-pick advice.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
