'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { JwtResponse } from '@/lib/api';

interface AuthUser {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  roles: string[];
  onboardingStatus: string;
  paymentCompleted: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('nebula_token');
    const userData = Cookies.get('nebula_user');
    if (token && userData) {
      try {
        const decoded = jwtDecode(token) as { exp: number };
        if (decoded.exp * 1000 > Date.now()) {
          setUserState(JSON.parse(userData));
        } else {
          Cookies.remove('nebula_token');
          Cookies.remove('nebula_user');
        }
      } catch {
        Cookies.remove('nebula_token');
        Cookies.remove('nebula_user');
      }
    }
    setLoading(false);
  }, []);

  const setUser = (userData: AuthUser | null) => {
    setUserState(userData);
    if (userData) {
      Cookies.set('nebula_token', userData.token, { expires: 7 });
      Cookies.set('nebula_user', JSON.stringify(userData), { expires: 7 });
    } else {
      Cookies.remove('nebula_token');
      Cookies.remove('nebula_user');
    }
  };

  const logout = () => {
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN') || false;
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN') || false;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isAdmin, isSuperAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
