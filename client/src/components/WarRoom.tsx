import { Button } from '@/components/ui/button';
import { useCoach } from '@/contexts/CoachContext';
import { useState } from 'react';
import { Send, Lightbulb, Target, Zap } from 'lucide-react';

const CHAMPIONS = [
  'Tryndamere', 'Garen', 'Darius', 'Fiora', 'Olaf',
  'Lux', 'Ahri', 'Akali', 'Yasuo', 'Zed',
  'Lee Sin', 'Evelynn', 'Kha\'Zix', 'Graves', 'Nidalee',
  'Caitlyn', 'Jinx', 'Ashe', 'Draven', 'Vayne',
  'Lulu', 'Thresh', 'Leona', 'Blitzcrank', 'Alistar',
];

const ROLES = ['solo', 'jungle', 'mid', 'duo', 'support'] as const;

interface CoachAdvice {
  strategy: string;
  items: string[];
  macroGoal: string;
  encouragement: string;
}

export default function WarRoom() {
  const { addMatchAnalysis, userProfile } = useCoach();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedChampion, setSelectedChampion] = useState<string>('');
  const [enemies, setEnemies] = useState<string[]>([]);
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCoachAdvice = async () => {
    if (!selectedRole || !selectedChampion) {
      alert('Please select your role and champion');
      return;
    }

    setLoading(true);

    // Simulate AI coach analysis
    setTimeout(() => {
      const mockAdvice: CoachAdvice = {
        strategy: `Great choice with ${selectedChampion} in the ${selectedRole} lane! ${
          enemies.length > 0
            ? `Against ${enemies.slice(0, 2).join(' and ')}, focus on playing around their cooldowns.`
            : 'Focus on farming efficiently and watching for roam opportunities.'
        } Your early game is crucial - play safe until you hit your power spike.`,
        items: [
          'Build defensive items first if behind',
          'Consider Maw of Malmortius if enemies have AP',
          'Prioritize boots for mobility',
        ],
        macroGoal: `Your role is to ${
          selectedRole === 'solo' ? 'split push and apply side lane pressure'
          : selectedRole === 'jungle' ? 'secure objectives and gank priority lanes'
          : selectedRole === 'mid' ? 'control the map and roam to impact other lanes'
          : selectedRole === 'duo' ? 'farm safely and position for teamfights'
          : 'protect your ADC and enable teamfights'
        }. Focus on this throughout the game.`,
        encouragement: `You've got this! ${selectedChampion} is a strong pick right now. Remember: stay calm, farm efficiently, and make smart macro decisions. Every small improvement counts. Let's climb! 💪`,
      };

      setAdvice(mockAdvice);
      addMatchAnalysis({
        champion: selectedChampion,
        role: selectedRole,
        enemies: enemies,
        coachAdvice: mockAdvice.strategy,
        itemRecommendations: mockAdvice.items,
        macroGoal: mockAdvice.macroGoal,
      });

      setLoading(false);
    }, 1500);
  };

  const toggleEnemy = (champion: string) => {
    setEnemies((prev) =>
      prev.includes(champion) ? prev.filter((c) => c !== champion) : [...prev, champion]
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 uppercase tracking-wider">⚔️ The War Room</h1>
        <p className="text-lg text-foreground max-w-2xl mx-auto">
          Tell me about your match setup, and I'll give you personalized coaching advice
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Role Selection */}
          <div className="coaching-card p-6 neon-glow">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Zap className="w-5 h-5 text-primary" />
              Your Role
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-3 rounded-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 ${
                    selectedRole === role
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50 border-primary'
                      : 'bg-muted/30 text-foreground hover:bg-muted/50 hover:border-primary/50 border-muted/50'
                  }`}
                >
                  {role === 'duo' ? 'ADC' : role === 'solo' ? 'Baron' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Champion Selection */}
          <div className="coaching-card p-6 neon-glow">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Target className="w-5 h-5 text-secondary" />
              Your Champion
            </h3>
            <select
              value={selectedChampion}
              onChange={(e) => setSelectedChampion(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border-2 border-secondary/50 bg-input text-foreground hover:border-secondary/80 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
            >
              <option value="">Select a champion...</option>
              {CHAMPIONS.map((champ) => (
                <option key={champ} value={champ}>
                  {champ}
                </option>
              ))}
            </select>
          </div>

          {/* Enemy Selection */}
          <div className="coaching-card p-6 neon-glow">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Lightbulb className="w-5 h-5 text-accent" />
              Enemy Team (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {CHAMPIONS.map((champ) => (
                <button
                  key={champ}
                  onClick={() => toggleEnemy(champ)}
                  className={`px-3 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all duration-200 border-2 ${
                    enemies.includes(champ)
                      ? 'bg-destructive text-white border-destructive shadow-lg shadow-destructive/50'
                      : 'bg-muted/30 text-foreground hover:bg-muted/50 border-muted/50 hover:border-destructive/50'
                  }`}
                >
                  {champ}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateCoachAdvice}
            disabled={!selectedRole || !selectedChampion || loading}
            className="w-full gaming-button py-6 text-lg"
          >
            {loading ? 'Analyzing...' : 'Get Coach Advice'}
            <Send className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Advice Section */}
        <div className="space-y-4">
          {advice ? (
            <>
              <div className="coaching-card p-6 border-l-4 border-primary neon-glow">
                <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wider">Strategy</h3>
                <p className="text-foreground leading-relaxed">{advice.strategy}</p>
              </div>

              <div className="coaching-card p-6 border-l-4 border-secondary neon-glow">
                <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wider">Item Recommendations</h3>
                <ul className="space-y-2">
                  {advice.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-secondary font-bold">▸</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="coaching-card p-6 border-l-4 border-accent neon-glow">
                <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wider">Macro Goal</h3>
                <p className="text-foreground leading-relaxed">{advice.macroGoal}</p>
              </div>

              <div className="coaching-card p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-l-4 border-primary neon-glow">
                <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wider">💪 Coach's Encouragement</h3>
                <p className="text-foreground leading-relaxed italic">{advice.encouragement}</p>
              </div>
            </>
          ) : (
            <div className="coaching-card p-12 text-center h-full flex flex-col items-center justify-center neon-glow">
              <Lightbulb className="w-16 h-16 text-muted-foreground/30 mb-4 animate-pulse" />
              <p className="text-muted-foreground text-lg">
                Fill in your match details and I'll provide personalized coaching advice
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
