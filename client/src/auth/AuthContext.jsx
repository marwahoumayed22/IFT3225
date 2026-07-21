import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAuthToken } from '../api/client';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);
const STORAGE_KEY = 'ambiance_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Restaure la session depuis le stockage local au chargement de l'app.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const { token: savedToken, user: savedUser } = JSON.parse(raw);
        setToken(savedToken);
        setUser(savedUser);
        setAuthToken(savedToken);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }, []);

  const login = useCallback(
    async (credentials) => {
      const { data } = await authApi.login(credentials);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (fields) => {
      const { data } = await authApi.register(fields);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    ready,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
