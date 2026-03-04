import { useState, useEffect } from 'react';
import { Sparkles, Bot, Shield } from 'lucide-react';
import CounterpickSearch from '@/components/CounterpickSearch';
import CounterpickResults from '@/components/CounterpickResults';

interface CounterData {
  name: string;
  role: string[];
  counters: { name: string; reason: string; build?: any; runes?: any }[];
  winConditions: string[];
  weaknesses: string[];
  powerSpikes: string;
}

type Tab = 'counterpick' | 'coach';

export default function WarRoom() {
  const [activeTab, setActiveTab] = useState<Tab>('counterpick');

  // Counterpick state
  const [champions, setChampions] = useState<string[]>([]);
  const [enemy, setEnemy] = useState('');
  const [result, setResult] = useState<CounterData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/counterpick/champions')
      .then((r) => r.json())
      .then((data) => setChampions(Array.isArray(data) ? data : []))
      .catch(() => setChampions([]));
  }, []);

  useEffect(() => {
    if (!enemy) { setResult(null); return; }
    setLoading(true);
    fetch(`/api/counterpick/${encodeURIComponent(enemy)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setResult(data); setLoading(false); })
      .catch(() => { setResult(null); setLoading(false); });
  }, [enemy]);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border pb-0">
        <TabButton
          active={activeTab === 'counterpick'}
          onClick={() => setActiveTab('counterpick')}
          icon={<Shield className="w-4 h-4" />}
          label="Counterpick"
        />
        <TabButton
          active={activeTab === 'coach'}
          onClick={() => setActiveTab('coach')}
          icon={<Bot className="w-4 h-4" />}
          label="Coach"
          badge="Coming Soon"
        />
      </div>

      {/* Counterpick tab — identical to simple-trixieverse */}
      {activeTab === 'counterpick' && (
        <div className="space-y-8">
          {/* Search */}
          <div className="max-w-md mx-auto">
            <CounterpickSearch
              label="Enemy Champion"
              placeholder="e.g. Yasuo"
              champions={champions}
              value={enemy}
              onChange={setEnemy}
              accentColor="primary"
            />
          </div>

          {/* Loading */}
          {loading && <LoadingCard />}

          {/* Results */}
          {result && !loading && (
            <div className="max-w-2xl mx-auto mt-6">
              <CounterpickResults data={result} />
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="coaching-card p-12 text-center neon-glow animate-glow-pulse max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Search for an enemy champion above to get counterpick intel
              </p>
            </div>
          )}
        </div>
      )}

      {/* Coach tab — coming soon */}
      {activeTab === 'coach' && (
        <div className="coaching-card p-16 text-center neon-glow max-w-md mx-auto">
          <Bot className="w-14 h-14 text-primary/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">AI Coach</h3>
          <p className="text-muted-foreground">
            Gemini-powered pre-match coaching is coming soon. Stay tuned!
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px cursor-pointer ${active
        ? 'border-primary text-primary'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }`}
    >
      {icon}
      {label}
      {badge && (
        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

function LoadingCard() {
  return (
    <div className="coaching-card p-8 text-center neon-glow max-w-md mx-auto">
      <div className="animate-shimmer rounded-sm h-6 w-48 mx-auto mb-3 bg-muted/30" />
      <div className="animate-shimmer rounded-sm h-4 w-64 mx-auto mb-2 bg-muted/20" />
      <div className="animate-shimmer rounded-sm h-4 w-56 mx-auto bg-muted/20" />
      <p className="text-muted-foreground mt-4 text-sm uppercase tracking-wider">Analyzing...</p>
    </div>
  );
}
