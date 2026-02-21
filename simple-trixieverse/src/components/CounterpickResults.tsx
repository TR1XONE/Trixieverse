import { Shield, Target, AlertTriangle, Zap, Footprints, Sparkles, Plus, Minus } from 'lucide-react';
import { getItemImageUrl, getItemColor, getItemDescription } from '@/utils/itemIcons';
import { getRuneImageUrl, getRuneColor, getRuneDescription } from '@/utils/runeIcons';
import { useState } from 'react';

interface ChampionBuild {
    core: string[];
    boots: string;
    enchant: string;
    situational?: string[];
}

interface ChampionRunes {
    keystone: string;
    domination: string;
    resolve: string;
    inspiration: string;
}

interface CounterData {
    name: string;
    role: string[];
    counters: { name: string; reason: string; build?: ChampionBuild | null; runes?: ChampionRunes | null }[];
    winConditions: string[];
    weaknesses: string[];
    powerSpikes: string;
}

/* ─── Tooltip ─────────────────────────────────────────── */

function Tooltip({ name, description, iconUrl, children }: { name: string; description: string; iconUrl?: string | null; children: React.ReactNode }) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const tipW = 260;
        let x = e.clientX + 14;
        if (x + tipW > window.innerWidth - 8) x = e.clientX - tipW - 14;
        setPos({ x, y: e.clientY - 16 });
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onMouseMove={handleMouseMove}
        >
            {children}
            {show && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left: pos.x, top: pos.y, transform: 'translateY(-100%)' }}
                >
                    <div className="bg-[#0d1117] border border-primary/30 rounded-lg px-3 py-2.5 shadow-2xl shadow-black/60 max-w-[260px]">
                        <div className="flex items-center gap-2 mb-1.5">
                            {iconUrl && <img src={iconUrl} alt="" className="w-8 h-8 rounded border border-white/15 flex-shrink-0" />}
                            <div className="text-sm font-bold text-white leading-tight">{name}</div>
                        </div>
                        <div className="text-[11px] leading-relaxed text-muted-foreground/90">{description}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Item Icon ───────────────────────────────────────── */

const ORDER_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

function ItemIcon({ name, order }: { name: string; order?: number }) {
    const [failed, setFailed] = useState(false);
    const url = getItemImageUrl(name);
    const desc = getItemDescription(name);

    const icon = (!url || failed) ? (
        (() => {
            const color = getItemColor(name);
            const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
                <div className="relative flex-shrink-0">
                    <div
                        className="w-10 h-10 rounded flex items-center justify-center text-[9px] font-bold border border-white/10"
                        style={{ background: `${color}20`, color, borderColor: `${color}30` }}
                    >
                        {initials}
                    </div>
                    {order !== undefined && (
                        <span className="absolute -top-1.5 -left-1 bg-primary text-[8px] font-bold text-black px-1 rounded-sm leading-tight">
                            {ORDER_LABELS[order] ?? `${order + 1}th`}
                        </span>
                    )}
                </div>
            );
        })()
    ) : (
        <div className="relative flex-shrink-0">
            <img
                src={url}
                alt={name}
                className="w-10 h-10 rounded border border-white/10"
                onError={() => setFailed(true)}
            />
            {order !== undefined && (
                <span className="absolute -top-1.5 -left-1 bg-primary text-[8px] font-bold text-black px-1 rounded-sm leading-tight">
                    {ORDER_LABELS[order] ?? `${order + 1}th`}
                </span>
            )}
        </div>
    );

    return <Tooltip name={name} description={desc} iconUrl={url}>{icon}</Tooltip>;
}

/* ─── Rune Icon ───────────────────────────────────────── */

function RuneIcon({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
    const [failed, setFailed] = useState(false);
    const url = getRuneImageUrl(name);
    const desc = getRuneDescription(name);
    const dim = size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
    const textSz = size === 'lg' ? 'text-[10px]' : 'text-[8px]';

    const icon = (!url || failed) ? (
        (() => {
            const color = getRuneColor(name);
            const initials = name.split(/[\s-]/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
                <div
                    className={`${dim} rounded-full flex items-center justify-center ${textSz} font-bold border border-white/10 flex-shrink-0`}
                    style={{ background: `${color}20`, color, borderColor: `${color}30` }}
                >
                    {initials}
                </div>
            );
        })()
    ) : (
        <img
            src={url}
            alt={name}
            className={`${dim} rounded-full border border-white/10 flex-shrink-0 bg-black/30`}
            onError={() => setFailed(true)}
        />
    );

    return <Tooltip name={name} description={desc} iconUrl={url}>{icon}</Tooltip>;
}

/* ─── Build Display ───────────────────────────────────── */

function BuildDisplay({ build }: { build: ChampionBuild }) {
    return (
        <div className="mt-2 pt-2 border-t border-primary/10">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1.5">
                    {build.core.map((item, i) => (
                        <ItemIcon key={item} name={item} order={i} />
                    ))}
                </div>
                <div className="h-8 w-px bg-primary/15 mx-1" />
                <ItemIcon name={build.boots} />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <Footprints className="w-3 h-3" />
                <span>{build.boots}</span>
                <span className="text-primary/30">·</span>
                <span>{build.enchant}</span>
            </div>
        </div>
    );
}

/* ─── Rune Display ────────────────────────────────────── */

function RuneDisplay({ runes }: { runes: ChampionRunes }) {
    return (
        <div className="mt-2 pt-2 border-t border-accent/10">
            <div className="flex items-center gap-2 mb-2">
                <RuneIcon name={runes.keystone} size="lg" />
                <div className="h-6 w-px bg-accent/15 mx-1" />
                <div className="flex gap-1.5">
                    <RuneIcon name={runes.domination} />
                    <RuneIcon name={runes.resolve} />
                    <RuneIcon name={runes.inspiration} />
                </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                <Sparkles className="w-3 h-3 text-accent/70" />
                <span className="text-accent/80 font-medium">{runes.keystone}</span>
                <span className="text-accent/30">·</span>
                <span>{runes.domination}</span>
                <span className="text-accent/30">·</span>
                <span>{runes.resolve}</span>
                <span className="text-accent/30">·</span>
                <span>{runes.inspiration}</span>
            </div>
        </div>
    );
}

/* ─── Counter Card (collapsible build/runes) ──────────── */

function CounterCard({ counter, index }: { counter: CounterData['counters'][0]; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const hasBuildData = counter.build || counter.runes;

    return (
        <div className="p-3 bg-primary/5 rounded-sm border border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg min-w-[24px]">#{index + 1}</span>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-foreground text-base">{counter.name}</span>
                        </div>
                        {hasBuildData && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded border border-primary/20 bg-primary/5 hover:bg-primary/15 hover:border-primary/40 transition-all text-xs text-primary/80 hover:text-primary cursor-pointer"
                                title={expanded ? 'Hide build' : 'Show build'}
                            >
                                {expanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                <span className="font-medium">{expanded ? 'Hide' : 'Build'}</span>
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{counter.reason}</p>
                    <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ maxHeight: expanded ? '500px' : '0px', opacity: expanded ? 1 : 0 }}
                    >
                        {counter.build && <BuildDisplay build={counter.build} />}
                        {counter.runes && <RuneDisplay runes={counter.runes} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────── */

export default function CounterpickResults({ data }: { data: CounterData }) {
    return (
        <div className="space-y-4">
            {/* Champion Header */}
            <div className="coaching-card p-5 neon-glow animate-fade-in-up">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl text-primary m-0">VS {data.name}</h2>
                    <div className="flex gap-2">
                        {data.role.map((r) => (
                            <span key={r} className="text-xs uppercase tracking-wider px-2 py-0.5 bg-accent/20 text-accent rounded-sm border border-accent/30 font-bold">
                                {r}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Counterpicks */}
            <div className="coaching-card p-5 border-l-4 border-primary animate-fade-in-up stagger-1">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Best Counterpicks
                </h3>
                <div className="space-y-3">
                    {data.counters.map((c, i) => (
                        <CounterCard key={c.name} counter={c} index={i} />
                    ))}
                </div>
            </div>

            {/* Win Conditions */}
            <div className="coaching-card p-5 border-l-4 border-secondary animate-fade-in-up stagger-2">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    Win Conditions
                </h3>
                <ul className="space-y-2">
                    {data.winConditions.map((wc, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="text-secondary font-bold mt-0.5">▸</span>
                            <span className="text-foreground text-sm leading-relaxed">{wc}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Weaknesses */}
            <div className="coaching-card p-5 border-l-4 border-destructive animate-fade-in-up stagger-3">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Key Weaknesses
                </h3>
                <ul className="space-y-2">
                    {data.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="text-destructive font-bold mt-0.5">✕</span>
                            <span className="text-foreground text-sm leading-relaxed">{w}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Power Spikes */}
            <div className="coaching-card p-5 border-l-4 border-accent bg-gradient-to-r from-accent/10 to-transparent animate-fade-in-up stagger-4">
                <h3 className="text-lg text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Power Spikes
                </h3>
                <p className="text-foreground text-sm leading-relaxed">{data.powerSpikes}</p>
            </div>
        </div>
    );
}
