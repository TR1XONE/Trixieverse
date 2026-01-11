import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <button
        onClick={() => setLanguage('sv')}
        className={`px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${
          language === 'sv'
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-muted/30'
        }`}
      >
        SV
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${
          language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-muted/30'
        }`}
      >
        EN
      </button>
    </div>
  );
}
