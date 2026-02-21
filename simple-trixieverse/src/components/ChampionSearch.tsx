import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface ChampionSearchProps {
    label: string;
    placeholder: string;
    champions: string[];
    value: string;
    onChange: (name: string) => void;
    accentColor?: string;
}

export default function ChampionSearch({
    label,
    placeholder,
    champions,
    value,
    onChange,
    accentColor = 'primary',
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
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {label}
            </label>

            <div className={`flex items-center gap-2 px-4 py-3 rounded-sm border-2 bg-input transition-all duration-200 ${borderColor} focus-within:ring-2 ${ringColor}`}>
                <Search className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-base"
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
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-card border border-primary/30 rounded-sm shadow-lg shadow-primary/10">
                    {filtered.map((name, idx) => (
                        <button
                            key={name}
                            type="button"
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${idx === highlightIdx
                                ? 'bg-primary/20 text-primary'
                                : 'text-foreground hover:bg-primary/10'
                                }`}
                            onMouseEnter={() => setHighlightIdx(idx)}
                            onClick={() => selectChampion(name)}
                        >
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
