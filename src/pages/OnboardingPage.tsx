import { useState } from 'react';
import { useLocation } from 'wouter';
import {
    Shield, Zap, Bot, Home, ChevronRight, CheckCircle2, Sparkles
} from 'lucide-react';

const STEPS = [
    {
        id: 'welcome',
        icon: <Sparkles className="w-10 h-10 text-primary" />,
        title: 'Welcome to TrixieVerse!',
        subtitle: 'Your Wild Rift coaching hub',
        body: 'TrixieVerse helps you get better at Wild Rift with a built-in counterpick database, pre-match strategy guides, and more. This quick tour takes about a minute.',
        cta: "Let's go →",
    },
    {
        id: 'warroom',
        icon: <Shield className="w-10 h-10 text-accent" />,
        title: 'War Room — Counterpick',
        subtitle: 'Know your enemy before the match',
        body: 'Head to War Room before every match. Search the enemy champion to instantly get the 5 best counters, win conditions, key weaknesses, and power spike timing — all based on Wild Rift meta.',
        cta: 'Got it →',
    },
    {
        id: 'coach',
        icon: <Bot className="w-10 h-10 text-secondary" />,
        title: 'AI Coach — Coming Soon',
        subtitle: 'Personalised pre-match advice',
        body: 'The AI Coach tab (powered by Gemini) will give you champion-specific role strategies, item tips, and macro goals before you load into game. It\'s coming soon — stay tuned!',
        cta: 'Got it →',
    },
    {
        id: 'dashboard',
        icon: <Home className="w-10 h-10 text-primary" />,
        title: 'Dashboard',
        subtitle: 'Track your journey',
        body: 'Your dashboard tracks streaks, XP, and coaching activity as you use the app. The more you engage, the more your profile grows. Start with a War Room search to earn your first XP!',
        cta: "Let's play! 🏆",
    },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [, navigate] = useLocation();

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const advance = () => {
        if (isLast) {
            navigate('/');
        } else {
            setStep((s) => s + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 scanlines">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Step dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-muted/30'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div
                    key={current.id}
                    className="coaching-card p-10 text-center neon-glow border-2 border-primary/20 animate-fade-in-up"
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            {current.icon}
                        </div>
                    </div>

                    {/* Text */}
                    <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                        {current.subtitle}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">{current.title}</h2>
                    <p className="text-muted-foreground text-base leading-relaxed mb-8">
                        {current.body}
                    </p>

                    {/* Already-done steps summary */}
                    {step > 0 && (
                        <div className="mb-6 space-y-1">
                            {STEPS.slice(0, step).map((s) => (
                                <div key={s.id} className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary/50" />
                                    <span>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA button */}
                    <button
                        onClick={advance}
                        className="w-full gaming-button flex items-center justify-center gap-2"
                    >
                        {current.cta}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>

                    {/* Skip */}
                    {!isLast && (
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                        >
                            Skip tutorial
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
