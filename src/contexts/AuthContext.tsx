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

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');

        if (stored && token) {
          const parsedUser = JSON.parse(stored);
          // Verify token is still valid (in production, call backend)
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // In production, this would call your backend API
      // For now, we'll do client-side simulation with localStorage
      const response = {
        user: {
          id: `user_${Date.now()}`,
          email,
          username: email.split('@')[0],
          createdAt: new Date(),
        },
        token: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      // Store user and token
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);

      setUser(response.user);
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
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // In production, this would call your backend API
      const response = {
        user: {
          id: `user_${Date.now()}`,
          email,
          username,
          createdAt: new Date(),
        },
        token: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);

      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const loginWithDiscord = async (code: string) => {
    try {
      setIsLoading(true);

      // In production, this would exchange code for Discord token
      // Then call backend to link Discord account
      const response = {
        user: {
          id: `user_${Date.now()}`,
          email: `discord_${Math.random().toString(36).substring(7)}@discord.local`,
          username: `Discord User ${Math.random().toString(36).substring(7)}`,
          createdAt: new Date(),
          discordId: code, // This would be the actual Discord ID
        },
        token: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      };

      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);

      setUser(response.user);
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
