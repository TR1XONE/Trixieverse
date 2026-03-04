import { useState, useEffect } from 'react';
import { Sparkles, Monitor, Smartphone } from 'lucide-react';
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

type Layout = 'desktop' | 'mobile';

export default function CounterpickPage() {
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
        <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-6">

            {/* Search Container */}
            <div className={`w-full max-w-xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${result || loading ? 'mt-4 mb-6' : 'mt-[15vh]'
                }`}>

                <div className={`transition-all duration-500 rounded-xl ${(!result && !loading) ? 'animate-glow-pulse' : ''}`}>
                    <CounterpickSearch
                        label=""
                        placeholder=""
                        champions={champions}
                        value={enemy}
                        onChange={setEnemy}
                        accentColor="primary"
                        autoFocus
                    />
                </div>

                {enemy && !loading && (
                    <button
                        onClick={() => setEnemy('')}
                        className="mt-3 w-full text-center text-xs text-muted-foreground/40 hover:text-cyan-400 transition-colors cursor-pointer tracking-widest uppercase"
                    >
                        ← Clear Selection
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="w-full max-w-4xl animate-fade-in-up">
                    <LoadingCard />
                </div>
            )}

            {/* Results Container */}
            {result && !loading && (
                <div className="w-full max-w-2xl px-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
                    <CounterpickResults data={result} />
                </div>
            )}
        </div>
    );
}


function LoadingCard() {
    return (
        <div className="coaching-card p-8 text-center neon-glow">
            <div className="animate-shimmer rounded-sm h-6 w-48 mx-auto mb-3 bg-muted/30" />
            <div className="animate-shimmer rounded-sm h-4 w-64 mx-auto mb-2 bg-muted/20" />
            <div className="animate-shimmer rounded-sm h-4 w-56 mx-auto bg-muted/20" />
            <p className="text-muted-foreground mt-4 text-sm uppercase tracking-wider">Analyzing...</p>
        </div>
    );
}
