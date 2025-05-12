'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthResponse } from '../lib/types';
import { setGlobalLogout } from '../lib/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get('user');
    const storedToken = Cookies.get('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('user');
    Cookies.remove('token');
    router.push('/auth/login');
  };

  // Set up global logout function
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.accessToken);
    Cookies.set('user', JSON.stringify(data.user), { expires: 7 }); // Expires in 7 days
    Cookies.set('token', data.accessToken, { expires: 7 }); // Expires in 7 days
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
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