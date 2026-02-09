import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function DiscordCallbackPage() {
  const [, navigate] = useLocation();
  const { loginWithDiscord } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const run = async () => {
      setError('');
      setSuccess('');

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        setError('Missing OAuth code/state');
        return;
      }

      try {
        await loginWithDiscord(code, state);
        setSuccess('Discord login successful!');
        setTimeout(() => navigate('/'), 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Discord login failed');
      }
    };

    run();
  }, [loginWithDiscord, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 scanlines">
      <div className="relative w-full max-w-md">
        <div className="coaching-card p-8 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-cyan-400 uppercase tracking-widest">
              Connecting Discord
            </div>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">Please wait…</p>
          </div>

          {!error && !success && (
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="uppercase tracking-wider text-sm font-bold">Authenticating</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-sm bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-3 rounded-sm bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {error && (
            <button onClick={() => navigate('/login')} className="w-full gaming-button mt-6">
              BACK TO LOGIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
