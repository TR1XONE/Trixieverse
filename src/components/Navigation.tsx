import { Link, useLocation } from 'wouter';
import { User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Hide nav entirely on auth/onboarding pages
  const hiddenRoutes = ['/login', '/signup', '/onboarding', '/discord/callback'];
  if (hiddenRoutes.includes(location)) return null;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/10 shadow-sm shadow-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:text-primary transition-colors group"
          >

            <span className="uppercase tracking-widest text-sm hidden"></span>
          </Link>

          {/* Right side — tiny auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    title="Admin Dashboard"
                    className="p-1.5 rounded-sm text-primary/70 hover:text-primary hover:bg-primary/10 transition-all mr-2"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <span className="text-xs text-muted-foreground/50 hidden sm:inline">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 rounded-sm text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/20 transition-all"
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                title="Sign in"
                className="p-1.5 rounded-sm text-muted-foreground/30 hover:text-muted-foreground/70 hover:bg-muted/10 transition-all"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
