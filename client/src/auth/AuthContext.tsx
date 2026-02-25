import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/http';
import type { User } from '../types';
import { getToken, setToken } from '../lib/storage';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    const t = token ?? getToken();
    if (!t) {
      setUser(null);
      return;
    }
    const me = await apiFetch<User>('/users/me', { token: t });
    setUser(me);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        await refreshMe();
      } catch {
        if (!cancelled) {
          setToken(null);
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
  }

  async function register(email: string, password: string) {
    const res = await apiFetch<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    setTokenState(res.accessToken);
    setUser(res.user);
  }

  function logout() {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
