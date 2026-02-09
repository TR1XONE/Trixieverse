import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.username, formData.password);
      setSuccess('Account created successfully!');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 scanlines">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        <div className="coaching-card p-8 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-cyan-400 mb-2 uppercase tracking-widest">
              ⚔️ TRIXIEVERSE
            </div>
            <p className="text-muted-foreground uppercase tracking-wider text-sm">
              Join the Legend
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 rounded-sm bg-slate-900/50 border border-cyan-500/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  className="w-full pl-10 pr-4 py-2 rounded-sm bg-slate-900/50 border border-cyan-500/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-sm bg-slate-900/50 border border-cyan-500/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-cyan-400/50" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-sm bg-slate-900/50 border border-cyan-500/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-sm bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-3 rounded-sm bg-green-500/10 border border-green-500/30">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gaming-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
              >
                Login
              </button>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-3 rounded-sm bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-400/80">
              💡 Demo: Create any account to test the auth system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
