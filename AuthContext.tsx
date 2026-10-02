import { ApiError, getProfile } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  authLoading: boolean;
  login: (accessToken: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const login = useCallback(async (accessToken: string, userData: User) => {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync('student-service-token', accessToken);
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('student-service-token');
    } catch (error) {
      console.warn('Could not remove the saved session token:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      if (Platform.OS === 'web') return;
      const savedToken = await SecureStore.getItemAsync('student-service-token');
      if (!savedToken) return;
      const profile = await getProfile(savedToken);
      setToken(savedToken);
      setUser(profile);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await SecureStore.deleteItemAsync('student-service-token');
        return;
      }
      console.warn('Session restoration failed:', error);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // SecureStore is native-only; web sessions remain in memory for this tab.
  return (
    <AuthContext.Provider value={useMemo(() => ({ token, user, authLoading, login, logout, restoreSession }), [token, user, authLoading, login, logout, restoreSession])}>
      {children}
    </AuthContext.Provider>
  );
}
