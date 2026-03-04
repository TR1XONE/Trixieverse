import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { getChampionImageUrl } from '@/utils/championIcons';

interface ChampionSearchProps {
    label: string;
    placeholder: string;
    champions: string[];
    value: string;
    onChange: (name: string) => void;
    accentColor?: string;
    autoFocus?: boolean;
}

export default function ChampionSearch({
    label,
    placeholder,
    champions,
    value,
    onChange,
    accentColor = 'primary',
    autoFocus = false,
}: ChampionSearchProps) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query
        ? champions.filter((c) =>
            c.toLowerCase().includes(query.toLowerCase())
        )
        : champions;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync external value changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    const selectChampion = (name: string) => {
        setQuery(name);
        setIsOpen(false);
        onChange(name);
    };

    const clearSelection = () => {
        setQuery('');
        onChange('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIdx((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filtered[highlightIdx]) {
            e.preventDefault();
            selectChampion(filtered[highlightIdx]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const borderColor = accentColor === 'secondary' ? 'border-secondary/30 hover:border-secondary/60 focus-within:border-secondary' : 'border-primary/30 hover:border-primary/60 focus-within:border-primary';
    const ringColor = accentColor === 'secondary' ? 'focus-within:ring-secondary/30' : 'focus-within:ring-primary/30';
    const iconColor = accentColor === 'secondary' ? 'text-secondary' : 'text-primary';

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-black/90 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(6,182,212,0.3)] border border-cyan-500/20 focus-within:border-cyan-400 focus-within:shadow-[0_0_80px_rgba(6,182,212,0.4)]`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/30 text-lg md:text-2xl font-black uppercase tracking-widest"
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setHighlightIdx(0);
                        if (e.target.value === '') onChange('');
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <button
                        onClick={clearSelection}
                        className="text-muted-foreground/50 hover:text-cyan-400 transition-colors p-2"
                        type="button"
                        title="Clear search"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 mt-4 w-full max-h-64 overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    {filtered.map((name, idx) => (
                        <button
                            key={name}
                            type="button"
                            className={`w-full flex items-center gap-4 text-left px-6 py-3 text-lg md:text-xl font-bold uppercase tracking-widest transition-all ${idx === highlightIdx
                                ? 'bg-cyan-500/20 text-cyan-400 pl-8 border-l-4 border-cyan-400'
                                : 'text-muted-foreground hover:bg-cyan-500/10 hover:text-foreground'
                                }`}
                            onMouseEnter={() => setHighlightIdx(idx)}
                            onClick={() => selectChampion(name)}
                        >
                            <img
                                src={getChampionImageUrl(name)}
                                alt={name}
                                className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover bg-black flex-shrink-0 shadow-md"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            {name}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query && filtered.length === 0 && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-primary/30 rounded-sm shadow-lg p-4 text-center text-muted-foreground text-sm">
                    No champion found
                </div>
            )}
        </div>
    );
}
