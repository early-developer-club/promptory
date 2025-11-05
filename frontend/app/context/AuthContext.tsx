'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hasChromeExt() {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return typeof w.chrome !== 'undefined' && !!w.chrome.runtime?.id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        setTokenState(storedToken);
      }
    } catch (e) {
      console.error("Failed to read token from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);

    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('access_token', newToken);

        // 확장 환경일 때만 메시지 전송
        if (hasChromeExt()) {
          try {
            const w = window as any;
            w.chrome.runtime?.sendMessage(
              'bmbdphohngnoggmpliocccppcfndlamm',
              { type: 'SET_TOKEN', token: newToken },
              (response: any) => {
                const lastErr = w.chrome.runtime?.lastError;
                if (lastErr) {
                  console.error('Error sending token to extension:', lastErr.message);
                  return;
                }
                if (response?.status !== 'success') {
                  console.error('Failed to send token to extension.', response?.message);
                }
              }
            );
          } catch (e) {
            console.error('Extension messaging failed:', e);
          }
        }
      } else {
        // 토큰 제거
        localStorage.removeItem('access_token');

        if (hasChromeExt()) {
          try {
            const w = window as any;
            w.chrome.storage?.local?.remove('access_token');
          } catch {
            /* no-op */
          }
        }
      }
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, setToken, logout }}>
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
