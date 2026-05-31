import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_BASE_URL } from '@/lib/api';

type User = {
  id: number;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authorizedFetch: (
    input: RequestInfo,
    init?: RequestInit
  ) => Promise<Response>;
  updateProfile: (data: { email?: string; password?: string }) => Promise<User>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'app_token_v1';

async function storageGet(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // ignore
    return null;
  }
}

async function storageSet(token: string | null) {
  try {
    if (Platform.OS === 'web') {
      if (token === null) localStorage.removeItem(TOKEN_KEY);
      else localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    if (token === null) await SecureStore.deleteItemAsync(TOKEN_KEY);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await storageGet();
      if (!mounted) return;
      if (stored) {
        setToken(stored);
        // fetch user
        try {
          const resp = await fetch(`${BACKEND_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (resp.ok) {
            const body = await resp.json();
            setUser(body);
          } else {
            // token invalid -> clear
            await storageSet(null);
            setToken(null);
            setUser(null);
          }
        } catch {
          // network error - keep token but no user
        }
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Registration failed: ${resp.status} ${txt}`);
    }
    // Backend returns created user (without password)
    const created = await resp.json();
    // After successful registration, do not auto-login (let user login)
    return created as User;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => null);
      const message = body?.error ?? 'Invalid credentials';
      throw new Error(message);
    }
    const body = await resp.json();
    const t = body.token as string;
    await storageSet(t);
    setToken(t);
    // fetch user
    const me = await fetch(`${BACKEND_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (me.ok) {
      const u = await me.json();
      setUser(u);
    }
  }, []);

  const logout = useCallback(async () => {
    await storageSet(null);
    setToken(null);
    setUser(null);
  }, []);

  const authorizedFetch = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const t = await storageGet();
      const headers = new Headers(init.headers ?? {});
      if (t) headers.set('Authorization', `Bearer ${t}`);
      const merged: RequestInit = { ...init, headers };
      return fetch(input, merged);
    },
    []
  );

  const updateProfile = useCallback(
    async (data: { email?: string; password?: string }) => {
      if (!token) throw new Error('Not authenticated');
      const resp = await fetch(`${BACKEND_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Update failed: ${resp.status} ${txt}`);
      }
      const u = await resp.json();
      setUser(u);
      return u as User;
    },
    [token]
  );

  const deleteAccount = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${BACKEND_BASE_URL}/api/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status === 404) throw new Error('User not found');
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Delete failed: ${resp.status} ${txt}`);
    }
    await storageSet(null);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      register,
      login,
      logout,
      authorizedFetch,
      updateProfile,
      deleteAccount,
    }),
    [
      user,
      token,
      loading,
      register,
      login,
      logout,
      authorizedFetch,
      updateProfile,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
