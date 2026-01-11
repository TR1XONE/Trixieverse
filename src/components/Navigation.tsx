import { Link, useLocation } from 'wouter';
import { Home, Zap, BookOpen, Wand2, Sparkles, Globe, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navigation() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/30 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 font-bold text-xl text-foreground hover:text-primary transition-all duration-300 group">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                ⚔️
              </div>
              <span className="uppercase tracking-wider">TrixieVerse</span>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link href="/">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/')
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 border border-primary/50'
                    : 'text-foreground hover:bg-primary/20 hover:border border-primary/30 hover:shadow-lg hover:shadow-primary/20'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">{t('nav.dashboard')}</span>
              </a>
            </Link>

            <Link href="/war-room">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/war-room')
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/40 border border-accent/50'
                    : 'text-foreground hover:bg-accent/20 hover:border border-accent/30 hover:shadow-lg hover:shadow-accent/20'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span className="hidden sm:inline">{t('nav.warRoom')}</span>
              </a>
            </Link>

            <Link href="/library">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/library')
                    ? 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40 border border-secondary/50'
                    : 'text-foreground hover:bg-secondary/20 hover:border border-secondary/30 hover:shadow-lg hover:shadow-secondary/20'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">{t('nav.library')}</span>
              </a>
            </Link>

            <Link href="/coach">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/coach')
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 border border-orange-500/50'
                    : 'text-foreground hover:bg-orange-500/20 hover:border border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/20'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                <span className="hidden sm:inline">{t('nav.coach')}</span>
              </a>
            </Link>

            <Link href="/coachOS">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/coachOS')
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 border border-purple-500/50'
                    : 'text-foreground hover:bg-purple-500/20 hover:border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">CoachOS</span>
              </a>
            </Link>

            <Link href="/settings">
              <a
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200 uppercase tracking-wider font-bold text-sm ${
                  isActive('/settings')
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40 border border-cyan-500/50'
                    : 'text-foreground hover:bg-cyan-500/20 hover:border border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Settings</span>
              </a>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-primary/30">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={() => setLanguage('sv')}
                className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                  language === 'sv'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/30'
                }`}
              >
                SV
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/30'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
