import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  discordId?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithDiscord: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const USER_KEY = 'auth_user';
  const ACCESS_TOKEN_KEY = 'auth_access_token';
  const REFRESH_TOKEN_KEY = 'auth_refresh_token';

  const mapUser = (raw: any): User => {
    const createdAtValue = raw?.createdAt ?? raw?.created_at;
    return {
      id: String(raw.id),
      email: String(raw.email),
      username: String(raw.username),
      createdAt: createdAtValue ? new Date(createdAtValue) : new Date(),
      discordId: raw?.discordId,
    };
  };

  const authFetch = async (input: string, init: RequestInit = {}) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    if (!headers.has('content-type') && init.body) {
      headers.set('content-type', 'application/json');
    }
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    return fetch(input, {
      ...init,
      headers,
    });
  };

  const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || 'Failed to refresh token');
    }

    const accessToken = payload?.tokens?.accessToken;
    const nextRefreshToken = payload?.tokens?.refreshToken ?? refreshToken;
    if (!accessToken) {
      throw new Error('Invalid refresh response');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
    return accessToken;
  };

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem(USER_KEY);
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
          return;
        }

        const me = async () => {
          const res = await authFetch('/api/auth/me');
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(payload?.error || 'Not authenticated');
          }
          const nextUser = mapUser(payload.user);
          localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
        };

        try {
          await me();
        } catch {
          await refreshAccessToken();
          await me();
        }

        if (stored) {
          try {
            const parsedUser = mapUser(JSON.parse(stored));
            setUser(parsedUser);
          } catch {
            // ignore
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Login failed');
      }

      const accessToken = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      if (!accessToken || !refreshToken) {
        throw new Error('Login response missing tokens');
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      const nextUser = mapUser(payload.user);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true);

      // Validation
      if (!email || !username || !password) {
        throw new Error('All fields are required');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword: password,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Signup failed');
      }

      const accessToken = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;
      if (!accessToken || !refreshToken) {
        throw new Error('Signup response missing tokens');
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      const nextUser = mapUser(payload.user);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const loginWithDiscord = async (code: string) => {
    try {
      setIsLoading(true);

      throw new Error('Discord login is not configured');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loginWithDiscord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
