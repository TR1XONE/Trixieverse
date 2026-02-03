import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, User, Calendar, LogOut, Trash2, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UserProfilePage() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      logout();
      navigate('/login');
    } catch (err) {
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      // In production, call API to delete account
      // For now, just logout
      logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return null;
  }

  const formattedDate = user.createdAt instanceof Date 
    ? user.createdAt.toLocaleDateString()
    : new Date(user.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-12 px-4 scanlines">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-cyan-400 uppercase tracking-widest mb-2">
            ⚔️ PROFILE
          </h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Manage your TrixieVerse account
          </p>
        </div>

        {/* Main Card */}
        <div className="coaching-card p-8 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-cyan-500/30 neon-glow mb-6">
          {/* User Info Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>

            <div className="space-y-4">
              {/* Username */}
              <div className="p-4 rounded-sm bg-slate-900/50 border border-cyan-500/20">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Username
                </label>
                <p className="text-lg text-foreground font-semibold">{user.username}</p>
              </div>

              {/* Email */}
              <div className="p-4 rounded-sm bg-slate-900/50 border border-cyan-500/20">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <p className="text-lg text-foreground font-mono">{user.email}</p>
              </div>

              {/* Member Since */}
              <div className="p-4 rounded-sm bg-slate-900/50 border border-cyan-500/20">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <p className="text-lg text-foreground">{formattedDate}</p>
              </div>

              {/* User ID */}
              <div className="p-4 rounded-sm bg-slate-900/50 border border-cyan-500/20">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  User ID
                </label>
                <p className="text-sm text-foreground font-mono text-cyan-400/80">{user.id}</p>
              </div>

              {/* Discord Status */}
              {user.discordId ? (
                <div className="p-4 rounded-sm bg-slate-900/50 border border-green-500/20">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Discord Account
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-green-400">Connected</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-sm bg-slate-900/50 border border-muted-foreground/20">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Discord Account
                  </label>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-sm bg-red-500/10 border border-red-500/30 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 p-3 rounded-sm bg-green-500/10 border border-green-500/30 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 border-t border-cyan-500/20">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full gaming-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  LOGOUT
                </>
              )}
            </button>

            {/* Delete Account Button */}
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="w-full gaming-button-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/20 hover:bg-red-500/30 border-red-500/50 hover:border-red-500/70 text-red-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  {showDeleteConfirm ? 'CONFIRM DELETE' : 'DELETE ACCOUNT'}
                </>
              )}
            </button>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400 mb-2">
                  ⚠️ This action cannot be undone. All your data will be permanently deleted.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="coaching-card p-6 bg-gradient-to-br from-slate-900/60 to-blue-900/30 border-2 border-cyan-500/20">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
            🔒 Security Settings (Coming Soon)
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Two-Factor Authentication
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Login History
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
