import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component
 * Wraps pages that require authentication
 * Redirects to /login if not authenticated
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 scanlines">
        <div className="text-center">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <p className="text-foreground font-bold uppercase tracking-wider">
            Verifying Access...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, show error and redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 scanlines">
        <div className="relative w-full max-w-md">
          <div className="coaching-card p-8 bg-gradient-to-br from-slate-900/80 to-blue-900/40 border-2 border-red-500/30">
            {fallback || (
              <>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <h1 className="text-xl font-bold text-red-400 uppercase tracking-wider">
                    Access Denied
                  </h1>
                </div>

                <p className="text-center text-muted-foreground mb-6">
                  You must be logged in to access this page.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full gaming-button"
                >
                  GO TO LOGIN
                </button>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full gaming-button-secondary mt-3"
                >
                  CREATE ACCOUNT
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default ProtectedRoute;
