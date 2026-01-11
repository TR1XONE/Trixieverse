import { Button } from '@/components/ui/button';
import { useCoach } from '@/contexts/CoachContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { Sparkles, Target, Zap, Flame } from 'lucide-react';

export default function DashboardWelcome() {
  const { userProfile } = useCoach();
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Hero Section - Gaming Style */}
      <div className="relative rounded-sm overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/20 border-2 border-primary/50 p-8 md:p-12 neon-glow scanlines">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(/images/hero-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 uppercase tracking-wider">
                {t('dashboard.title')} ⚔️
              </h1>
              <p className="text-lg text-foreground max-w-2xl font-medium">
                {t('dashboard.subtitle')}
              </p>
              <p className="text-sm text-secondary mt-3 italic">
                {t('dashboard.motto')}
              </p>
            </div>
            <Flame className="w-12 h-12 text-accent flex-shrink-0 animate-glow-pulse" />
          </div>
          
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link href="/war-room">
              <Button size="lg" className="gaming-button">
                <Zap className="w-5 h-5 mr-2" />
                {t('dashboard.startWarRoom')}
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="rounded-sm border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/20 hover:shadow-lg hover:shadow-secondary/30 uppercase font-bold tracking-wider">
                {t('dashboard.viewMetaGuides')}
              </Button>
            </Link>
            <Link href="/coach">
              <Button size="lg" variant="outline" className="rounded-sm border-2 border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 uppercase font-bold tracking-wider">
                {t('dashboard.meetYourCoach')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats - Gaming Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="coaching-card p-6 neon-glow group hover:border-primary/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">{t('dashboard.currentRank')}</h3>
            <Target className="w-6 h-6 text-primary group-hover:animate-spin" />
          </div>
          <p className="text-3xl font-bold text-primary mb-2 uppercase">{userProfile?.currentRank || 'Iron'}</p>
          <p className="text-sm text-muted-foreground">{t('dashboard.targetRank')}: {userProfile?.targetRank || 'Legendary'}</p>
        </div>

        <div className="coaching-card p-6 neon-glow group hover:border-accent/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">{t('dashboard.mainRole')}</h3>
            <Zap className="w-6 h-6 text-accent group-hover:animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-accent capitalize mb-2 uppercase">
            {userProfile?.mainRole || 'Not Set'}
          </p>
          <p className="text-sm text-muted-foreground">{t('dashboard.choosePosition')}</p>
        </div>

        <div className="coaching-card p-6 neon-glow group hover:border-secondary/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">{t('dashboard.championPool')}</h3>
            <Sparkles className="w-6 h-6 text-secondary group-hover:animate-bounce" />
          </div>
          <p className="text-3xl font-bold text-secondary mb-2">
            {userProfile?.championPool.length || 0}
          </p>
          <p className="text-sm text-muted-foreground">{t('dashboard.championsMastered')}</p>
        </div>
      </div>

      {/* TrixieVerse Info Section */}
      <div className="coaching-card p-6 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-2 border-purple-500/30 neon-glow">
        <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-wider">{t('dashboard.aboutTrixieVerse')}</h3>
        <p className="text-foreground mb-3">
          {t('dashboard.aboutText')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.aboutText2')}
        </p>
      </div>
    </div>
  );
}
