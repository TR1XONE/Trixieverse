import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ChampionSearch from '@/components/ChampionSearch';
import CounterpickResults from '@/components/CounterpickResults';
import TrixieVerseLogo from '@/components/TrixieVerseLogo';

interface CounterData {
    name: string;
    role: string[];
    counters: { name: string; reason: string; build?: any }[];
    winConditions: string[];
    weaknesses: string[];
    powerSpikes: string;
}

export default function CounterpickPage() {
    const [champions, setChampions] = useState<string[]>([]);
    const [enemy, setEnemy] = useState('');
    const [result, setResult] = useState<CounterData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/counterpick/champions')
            .then((r) => r.json())
            .then(setChampions)
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
        <div className="space-y-8">
            {/* Animated Brand Logo */}
            <TrixieVerseLogo />

            {/* Single Search Box */}
            <div className="max-w-md mx-auto">
                <ChampionSearch
                    label="Enemy Champion"
                    placeholder="e.g. Yasuo"
                    champions={champions}
                    value={enemy}
                    onChange={setEnemy}
                    accentColor="primary"
                />
            </div>

            {/* Results */}
            {loading && <LoadingCard />}
            {result && !loading && (
                <div className="max-w-2xl mx-auto mt-6">
                    <CounterpickResults data={result} />
                </div>
            )}

            {/* Empty State */}
            {!result && !loading && (
                <div className="coaching-card p-12 text-center neon-glow animate-glow-pulse max-w-md mx-auto">
                    <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                        Search for an enemy champion above to get counterpick intel
                    </p>
                </div>
            )}
        </div>
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
