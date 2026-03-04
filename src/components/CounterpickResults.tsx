import { Shield, Target, AlertTriangle, Zap, Footprints, Sparkles, Plus, Minus } from 'lucide-react';
import { getItemImageUrl, getItemColor, getItemDescription } from '@/utils/itemIcons';
import { getRuneImageUrl, getRuneColor, getRuneDescription } from '@/utils/runeIcons';
import { getChampionImageUrl } from '@/utils/championIcons';
import { useState } from 'react';
import { createPortal } from 'react-dom';

// Wild Rift skill order lookup — abilities are labeled 1, 2, 3, Ult
// Format: [max_first, max_second, max_third, ult]
const SKILL_ORDER: Record<string, string[]> = {
    'Aatrox': ['1', '3', '2', 'Ult'], 'Ahri': ['3', '1', '2', 'Ult'], 'Akali': ['1', '3', '2', 'Ult'],
    'Akshan': ['1', '3', '2', 'Ult'], 'Alistar': ['2', '1', '3', 'Ult'], 'Amumu': ['3', '1', '2', 'Ult'],
    'Annie': ['1', '3', '2', 'Ult'], 'Ashe': ['1', '3', '2', 'Ult'], 'Aurelion Sol': ['1', '3', '2', 'Ult'],
    'Blitzcrank': ['1', '3', '2', 'Ult'], 'Brand': ['2', '1', '3', 'Ult'], 'Braum': ['1', '3', '2', 'Ult'],
    'Caitlyn': ['1', '3', '2', 'Ult'], 'Camille': ['1', '3', '2', 'Ult'], 'Corki': ['1', '3', '2', 'Ult'],
    'Darius': ['1', '3', '2', 'Ult'], 'Diana': ['1', '3', '2', 'Ult'], 'Dr. Mundo': ['1', '3', '2', 'Ult'],
    'Draven': ['1', '3', '2', 'Ult'], 'Ekko': ['1', '3', '2', 'Ult'], 'Evelynn': ['1', '3', '2', 'Ult'],
    'Ezreal': ['1', '3', '2', 'Ult'], 'Fiora': ['1', '3', '2', 'Ult'], 'Fizz': ['1', '3', '2', 'Ult'],
    'Galio': ['1', '3', '2', 'Ult'], 'Garen': ['3', '1', '2', 'Ult'], 'Gragas': ['1', '3', '2', 'Ult'],
    'Graves': ['1', '3', '2', 'Ult'], 'Gwen': ['1', '3', '2', 'Ult'], 'Irelia': ['1', '3', '2', 'Ult'],
    'Janna': ['3', '1', '2', 'Ult'], 'Jarvan IV': ['1', '3', '2', 'Ult'], 'Jax': ['1', '3', '2', 'Ult'],
    'Jayce': ['1', '3', '2', 'Ult'], 'Jhin': ['1', '3', '2', 'Ult'], 'Jinx': ['1', '3', '2', 'Ult'],
    "Kai'Sa": ['1', '2', '3', 'Ult'], 'Karma': ['1', '3', '2', 'Ult'], 'Kassadin': ['1', '3', '2', 'Ult'],
    'Katarina': ['1', '3', '2', 'Ult'], 'Kennen': ['1', '3', '2', 'Ult'], "Kha'Zix": ['1', '3', '2', 'Ult'],
    'Lee Sin': ['1', '3', '2', 'Ult'], 'Leona': ['2', '1', '3', 'Ult'], 'Lissandra': ['1', '3', '2', 'Ult'],
    'Lucian': ['1', '3', '2', 'Ult'], 'Lulu': ['1', '3', '2', 'Ult'], 'Lux': ['1', '3', '2', 'Ult'],
    'Malphite': ['1', '3', '2', 'Ult'], 'Miss Fortune': ['1', '3', '2', 'Ult'], 'Mordekaiser': ['1', '3', '2', 'Ult'],
    'Morgana': ['1', '3', '2', 'Ult'], 'Nami': ['2', '1', '3', 'Ult'], 'Nasus': ['1', '3', '2', 'Ult'],
    'Nautilus': ['1', '3', '2', 'Ult'], 'Olaf': ['1', '3', '2', 'Ult'], 'Orianna': ['1', '3', '2', 'Ult'],
    'Pantheon': ['1', '3', '2', 'Ult'], 'Poppy': ['3', '1', '2', 'Ult'], 'Rakan': ['2', '3', '1', 'Ult'],
    'Rammus': ['3', '1', '2', 'Ult'], 'Renekton': ['1', '3', '2', 'Ult'], 'Rengar': ['1', '3', '2', 'Ult'],
    'Riven': ['1', '3', '2', 'Ult'], 'Senna': ['1', '3', '2', 'Ult'], 'Seraphine': ['1', '3', '2', 'Ult'],
    'Sett': ['1', '3', '2', 'Ult'], 'Shyvana': ['3', '1', '2', 'Ult'], 'Singed': ['3', '1', '2', 'Ult'],
    'Tristana': ['1', '3', '2', 'Ult'], 'Tryndamere': ['1', '3', '2', 'Ult'], 'Twisted Fate': ['1', '3', '2', 'Ult'],
    'Varus': ['1', '3', '2', 'Ult'], 'Vayne': ['1', '3', '2', 'Ult'], 'Vi': ['1', '3', '2', 'Ult'],
    'Vladimir': ['1', '3', '2', 'Ult'], 'Wukong': ['1', '3', '2', 'Ult'], 'Xayah': ['1', '3', '2', 'Ult'],
    'Xin Zhao': ['1', '3', '2', 'Ult'], 'Yasuo': ['1', '3', '2', 'Ult'], 'Zed': ['1', '3', '2', 'Ult'],
    'Ziggs': ['1', '3', '2', 'Ult'], 'Zilean': ['2', '1', '3', 'Ult'], 'Zoe': ['1', '3', '2', 'Ult'],
    'Zyra': ['3', '1', '2', 'Ult'],
};

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
    selfBuilds?: ChampionBuild[];
    selfRunes?: ChampionRunes | null;
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
            {show && createPortal(
                <div
                    style={{ position: 'fixed', left: pos.x, top: pos.y, transform: 'translateY(-100%)', zIndex: 9999, pointerEvents: 'none' }}
                >
                    <div className="bg-gradient-to-b from-[#1c2331] to-[#0d131f] border border-[#3b82f6]/40 border-t-[#eab308]/90 rounded px-3 py-3 shadow-2xl shadow-black max-w-[280px]">
                        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-white/10">
                            {iconUrl && <img src={iconUrl} alt="" className="w-10 h-10 rounded-sm border border-[#eab308]/40 shadow-inner flex-shrink-0 object-cover" />}
                            <div className="text-[14px] font-bold text-[#fde047] uppercase tracking-wide drop-shadow-md leading-tight">{name}</div>
                        </div>
                        {/* We add a parser to highlight numbers and stats to look more like the game */}
                        <div className="text-[12px] leading-relaxed text-slate-300 font-medium">
                            {description.split(/(\d+%?|\bAD\b|\bAP\b|\bHP\b|\bMR\b|\bArmor\b|\bAS\b|\bcrit\b|\bability haste\b)/i).map((part, i) => {
                                const lower = part.toLowerCase();
                                if (/^\d+%?$/.test(part)) return <span key={i} className="text-[#38bdf8] font-bold">{part}</span>;
                                if (lower === 'ad' || lower === 'armor') return <span key={i} className="text-[#f97316] font-bold">{part}</span>;
                                if (lower === 'ap' || lower === 'magic' || lower === 'mr') return <span key={i} className="text-[#a855f7] font-bold">{part}</span>;
                                if (lower === 'hp' || lower === 'health' || lower === 'heal') return <span key={i} className="text-[#22c55e] font-bold">{part}</span>;
                                if (lower === 'as' || lower === 'crit' || lower === 'ability haste') return <span key={i} className="text-[#fde047] font-bold">{part}</span>;
                                return <span key={i}>{part}</span>;
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

/* ─── Item Icon (Square for items) ─────────────────── */

function ItemIcon({ name, showLabel = false }: { name: string; showLabel?: boolean }) {
    const [failed, setFailed] = useState(false);
    const url = getItemImageUrl(name);
    const desc = getItemDescription(name);

    const square = (!url || failed) ? (
        (() => {
            const color = getItemColor(name);
            const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
                <div
                    className="w-11 h-11 rounded-md flex items-center justify-center text-[11px] font-bold border border-white/10 flex-shrink-0"
                    style={{ background: `linear-gradient(to bottom right, ${color}30, ${color}10)`, color, borderColor: `${color}40` }}
                >
                    {initials}
                </div>
            );
        })()
    ) : (
        <img
            src={url}
            alt={name}
            className="w-11 h-11 rounded-md border border-white/10 shadow-sm flex-shrink-0 bg-black/40 object-cover"
            onError={() => setFailed(true)}
        />
    );

    return (
        <Tooltip name={name} description={desc} iconUrl={url}>
            <div className="flex flex-col items-center gap-1.5 w-[52px]">
                {square}
                {showLabel && (
                    <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight line-clamp-2">{name}</span>
                )}
            </div>
        </Tooltip>
    );
}

/* ─── Rune Icon (Circular) ─────────────────── */

function RuneIcon({ name, showLabel = false, size = 'sm' }: { name: string; showLabel?: boolean; size?: 'sm' | 'lg' }) {
    const [failed, setFailed] = useState(false);
    const url = getRuneImageUrl(name);
    const desc = getRuneDescription(name);

    const dim = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
    const textDim = size === 'lg' ? 'text-[13px]' : 'text-[9px]';

    const circle = (!url || failed) ? (
        (() => {
            const color = getRuneColor(name);
            const initials = name.split(/[\s-]/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
                <div
                    className={`${dim} rounded-full flex items-center justify-center ${textDim} font-bold border-2 border-white/10 flex-shrink-0`}
                    style={{ background: `radial-gradient(circle, ${color}30, transparent)`, color, borderColor: `${color}40` }}
                >
                    {initials}
                </div>
            );
        })()
    ) : (
        <div className={`relative ${dim} rounded-full flex-shrink-0 ${size === 'lg' ? 'p-[2px] bg-gradient-to-b from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20' : 'border border-white/10'}`}>
            <img
                src={url}
                alt={name}
                className="w-full h-full rounded-full bg-black/40 object-cover"
                onError={() => setFailed(true)}
            />
        </div>
    );

    return (
        <Tooltip name={name} description={desc} iconUrl={url}>
            <div className="flex flex-col items-center gap-1.5 w-[52px]">
                {circle}
                {showLabel && (
                    <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight line-clamp-2">{name}</span>
                )}
            </div>
        </Tooltip>
    );
}

/* ─── Combined Loadout Display ────────────────────────── */

function CombinedLoadoutDisplay({ build, runes }: { build?: ChampionBuild | null, runes?: ChampionRunes | null }) {
    if (!build && !runes) return null;

    // Combine core, boots, enchant
    const coreGroup = build ? [...build.core] : [];
    if (build?.boots && build.boots !== 'Basic Boots') coreGroup.push(build.boots);
    if (build?.enchant && build.enchant !== 'None') coreGroup.push(build.enchant);

    const flexGroup = build?.situational || [];

    return (
        <div className="mt-4 p-4 rounded-xl border border-border/50 bg-black/5 dark:bg-black/20 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8">

            {/* Keystone Section */}
            {runes && (
                <div className="flex flex-col items-center min-w-[100px] shrink-0">
                    <div className="text-[11px] font-extrabold text-foreground uppercase tracking-widest mb-3">KEYSTONE</div>
                    <RuneIcon name={runes.keystone} showLabel size="lg" />
                </div>
            )}

            {/* Build Section */}
            {build && (
                <div className="flex-1 flex flex-col items-center md:items-start min-w-0">
                    <div className="text-[11px] font-extrabold text-foreground uppercase tracking-widest mb-3">EXAMPLE BUILD</div>

                    <div className="flex items-start flex-wrap gap-y-4">
                        {/* Core Items with + */}
                        {coreGroup.map((item, idx) => (
                            <div key={`core-${idx}`} className="flex items-start">
                                <ItemIcon name={item} showLabel />
                                {idx < coreGroup.length - 1 && (
                                    <div className="text-green-500 px-1.5 font-bold text-lg mt-2">+</div>
                                )}
                            </div>
                        ))}

                        {/* Divider space */}
                        {coreGroup.length > 0 && flexGroup.length > 0 && (
                            <div className="w-4"></div>
                        )}

                        {/* Flexible Items with <-> */}
                        {flexGroup.map((item, idx) => (
                            <div key={`flex-${idx}`} className="flex items-start">
                                <ItemIcon name={item} showLabel />
                                {idx < flexGroup.length - 1 && (
                                    <div className="text-green-500 px-1.5 text-sm font-bold mt-3">↔</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Secondary Runes */}
                    {runes && (
                        <div className="mt-4 pt-4 border-t border-border/50 w-full flex flex-col items-center md:items-start">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">SECONDARY RUNES</div>
                            <div className="flex items-start justify-center md:justify-start gap-4">
                                <RuneIcon name={runes.domination} showLabel />
                                <RuneIcon name={runes.resolve} showLabel />
                                <RuneIcon name={runes.inspiration} showLabel />
                            </div>
                        </div>
                    )}
                </div>
            )}
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
                        <div className="flex items-center gap-3">
                            <img
                                src={getChampionImageUrl(counter.name)}
                                alt={counter.name}
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-primary/30 object-cover bg-black shadow-md flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="font-bold text-foreground text-lg sm:text-xl tracking-wide">{counter.name}</span>
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
                        style={{ maxHeight: expanded ? '800px' : '0px', opacity: expanded ? 1 : 0 }}
                    >
                        <CombinedLoadoutDisplay build={counter.build} runes={counter.runes} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────── */

export default function CounterpickResults({ data }: { data: CounterData }) {
    const [activeRank, setActiveRank] = useState(0);

    const builds = data.selfBuilds?.length ? data.selfBuilds : (data.counters[0]?.build ? [data.counters[0].build] : []);
    const build = builds[activeRank] || builds[0];
    const runes = data.selfRunes || data.counters[0]?.runes;
    const skillOrder = SKILL_ORDER[data.name] || ['1', '3', '2', 'Ult'];

    return (
        <div className="flex flex-col items-start w-full space-y-8 pb-16">

            {/* Champion Header */}
            <div className="w-full flex flex-col items-center text-center">
                <img
                    src={getChampionImageUrl(data.name)}
                    alt={data.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)] object-cover bg-black mb-6"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase tracking-widest drop-shadow-lg">
                    {data.name}
                </h2>
                <div className="flex justify-center flex-wrap gap-2 mt-3">
                    {data.role.map((r) => (
                        <span key={r} className="text-xs uppercase tracking-widest px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30 font-bold">
                            {r}
                        </span>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Build + Skill + Runes — vertical on mobile, horizontal on lg */}
            <div className="w-full flex flex-col gap-8">

                {/* Build Order */}
                {build && (
                    <div className="w-full opacity-0 animate-[fadeInUp_0.5s_ease-out_0.15s_forwards]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h3 className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-widest">
                                <Zap className="w-4 h-4" /> Build Order
                            </h3>

                            {/* Top 3 Builds Tab Selector */}
                            {builds.length > 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {builds.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveRank(i)}
                                            className={`px-4 py-1.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeRank === i
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                    : 'bg-black/20 text-muted-foreground border border-white/10 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            Rank {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {build.core.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <ItemIcon name={item} showLabel />
                                    {idx < build.core.length - 1 && <span className="text-cyan-500/40 font-black">+</span>}
                                </div>
                            ))}
                            {build.core.length > 0 && <span className="text-cyan-500/40 font-black px-1">+</span>}
                            <ItemIcon name={build.boots} showLabel />
                            <span className="text-cyan-500/40 font-black px-1">+</span>
                            <ItemIcon name={build.enchant} showLabel />
                        </div>
                    </div>
                )}

                {/* Skill Order */}
                <div className="w-full opacity-0 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards]">
                    <h3 className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-widest mb-3">
                        <Target className="w-4 h-4" /> Skill Order
                    </h3>
                    <div className="flex items-center gap-2 relative">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 -z-10" />
                        {skillOrder.map((skill, idx) => {
                            const isFirst = idx === 0;
                            const isUlt = skill === 'Ult';
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`flex items-center justify-center font-black rounded-full bg-black ${isFirst ? 'w-12 h-12 text-lg border-2 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                                        : isUlt ? 'w-11 h-11 text-xs border-2 border-purple-300 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                            : 'w-10 h-10 text-base border border-purple-500/40 text-purple-400 opacity-70'
                                        }`}>
                                        {skill}
                                    </div>
                                    {idx < skillOrder.length - 1 && <span className="text-purple-500/40 font-black text-xs">→</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Runes */}
                {runes && (
                    <div className="w-full opacity-0 animate-[fadeInUp_0.5s_ease-out_0.45s_forwards]">
                        <h3 className="flex items-center gap-2 text-xs font-black text-green-400 uppercase tracking-widest mb-3">
                            <Sparkles className="w-4 h-4" /> Runes
                        </h3>
                        <div className="flex items-start gap-5">
                            <RuneIcon name={runes.keystone} size="lg" showLabel />
                            <div className="flex flex-col gap-2 border-l border-white/10 pl-4">
                                <RuneIcon name={runes.domination} showLabel />
                                <RuneIcon name={runes.resolve} showLabel />
                                <RuneIcon name={runes.inspiration} showLabel />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full h-px bg-white/5" />

            {/* Counterpicks Section */}
            {data.counters.length > 0 && (
                <div className="w-full opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
                    <h3 className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-widest mb-5">
                        <Shield className="w-4 h-4" /> Counters
                    </h3>
                    <div className="flex flex-col gap-4">
                        {data.counters.slice(0, 5).map((counter, idx) => (
                            <div key={idx} className="flex flex-col gap-1 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards]" style={{ animationDelay: `${0.65 + idx * 0.08}s` }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-white uppercase tracking-widest">{counter.name}</span>
                                    <span className="text-xs text-white/20 font-mono">—</span>
                                    <span className="text-sm text-white/50">{counter.reason}</span>
                                </div>
                                {counter.build && (
                                    <div className="flex flex-wrap items-center gap-1.5 ml-1 mt-1">
                                        {counter.build.core.slice(0, 3).map((item, i) => (
                                            <ItemIcon key={i} name={item} />
                                        ))}
                                        <ItemIcon name={counter.build.boots} />
                                        {counter.runes && <RuneIcon name={counter.runes.keystone} />}
                                    </div>
                                )}
                                <div className="h-px bg-white/5 mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
