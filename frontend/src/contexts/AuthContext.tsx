import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      return {
        token,
        user,
        isAuthenticated: !!token && !!user,
      };
    } catch (error) {
      console.error('Error loading auth state:', error);
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    }
  });

  useEffect(() => {
    // Store current route for redirect after login
    if (!authState.isAuthenticated && window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/verify-otp') {
      localStorage.setItem('redirectPath', window.location.pathname);
    }
  }, [authState.isAuthenticated]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      token,
      user,
      isAuthenticated: true,
    });
    
    // Redirect to stored path or dashboard
    const redirectPath = localStorage.getItem('redirectPath');
    if (redirectPath) {
      localStorage.removeItem('redirectPath');
      window.location.href = redirectPath;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectPath');
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}